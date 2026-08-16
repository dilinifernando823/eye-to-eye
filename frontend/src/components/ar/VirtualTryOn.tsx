'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, Camera, Sparkles, AlertTriangle } from 'lucide-react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { removeBackground } from '@imgly/background-removal'

interface VirtualTryOnProps {
  productName: string
  imageUrl: string
  onClose: () => void
}

type Stage = 'idle' | 'loading-model' | 'requesting-camera' | 'running' | 'error'

const WASM_BASE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

// Outer eye corner indices in the MediaPipe face mesh (468/478 landmark topology)
const RIGHT_EYE_OUTER = 33
const LEFT_EYE_OUTER = 263

// MediaPipe's WASM build pipes its internal stdout (init/delegate logs) through
// console.error, which Next.js's dev overlay renders as a red error even though
// it's purely informational. Drop just that "INFO:"-prefixed noise.
if (typeof window !== 'undefined' && !(window as { __mpLogFiltered?: boolean }).__mpLogFiltered) {
  ;(window as { __mpLogFiltered?: boolean }).__mpLogFiltered = true
  const originalConsoleError = console.error
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].startsWith('INFO:')) return
    originalConsoleError(...args)
  }
}

export default function VirtualTryOn({ productName, imageUrl, onClose }: VirtualTryOnProps) {
  const [stage, setStage] = useState<Stage>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [modelReady, setModelReady] = useState(false)
  const [cutoutReady, setCutoutReady] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const landmarkerRef = useRef<FaceLandmarker | null>(null)
  const glassesImageRef = useRef<HTMLImageElement | null>(null)
  const cutoutUrlRef = useRef<string | null>(null)
  const rafRef = useRef<number | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stopEverything()
    }
  }, [])

  function stopEverything() {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    landmarkerRef.current?.close()
    landmarkerRef.current = null
    if (cutoutUrlRef.current) {
      URL.revokeObjectURL(cutoutUrlRef.current)
      cutoutUrlRef.current = null
    }
  }

  async function handleStart() {
    setErrorMessage('')
    setModelReady(false)
    setCutoutReady(false)
    setStage('loading-model')

    try {
      // @imgly/background-removal runs in a Web Worker, which resolves relative
      // URLs against its own (CDN) script location rather than this page — so a
      // relative imageUrl like "/products/..." must be made absolute first.
      const absoluteImageUrl = new URL(imageUrl, window.location.origin).toString()

      const [cutoutBlob, landmarker] = await Promise.all([
        removeBackground(absoluteImageUrl, {
          model: 'isnet_quint8',
          output: { format: 'image/png' },
        }).then((blob) => {
          if (mountedRef.current) setCutoutReady(true)
          return blob
        }),
        (async () => {
          const filesetResolver = await FilesetResolver.forVisionTasks(WASM_BASE_URL)
          const created = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numFaces: 1,
          })
          if (mountedRef.current) setModelReady(true)
          return created
        })(),
      ])

      if (!mountedRef.current) {
        landmarker.close()
        return
      }
      landmarkerRef.current = landmarker

      const cutoutUrl = URL.createObjectURL(cutoutBlob)
      cutoutUrlRef.current = cutoutUrl

      const glassesImage = new window.Image()
      glassesImage.src = cutoutUrl
      await new Promise<void>((resolve, reject) => {
        glassesImage.onload = () => resolve()
        glassesImage.onerror = () => reject(new Error('image-load-failed'))
      })
      if (!mountedRef.current) return
      glassesImageRef.current = glassesImage

      setStage('requesting-camera')

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      })
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream

      const video = videoRef.current
      if (!video) throw new Error('video-not-ready')
      video.srcObject = stream
      await video.play()

      setStage('running')
      startDetectionLoop()
    } catch (err) {
      console.error('Virtual try-on failed to start:', err)
      stopEverything()
      if (!mountedRef.current) return
      setStage('error')
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setErrorMessage(
          'Camera access was denied. Please allow camera permissions for this site in your browser settings and try again.'
        )
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setErrorMessage('No camera was found on this device.')
      } else {
        const detail = err instanceof Error ? err.message : String(err)
        setErrorMessage(`Something went wrong starting the try-on experience: ${detail}`)
      }
    }
  }

  function startDetectionLoop() {
    const video = videoRef.current
    const canvas = canvasRef.current
    const landmarker = landmarkerRef.current
    const glassesImage = glassesImageRef.current
    if (!video || !canvas || !landmarker || !glassesImage) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const render = () => {
      if (video.readyState >= 2) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const result = landmarker.detectForVideo(video, performance.now())
        const landmarks = result.faceLandmarks[0]

        if (landmarks) {
          const rightEye = landmarks[RIGHT_EYE_OUTER]
          const leftEye = landmarks[LEFT_EYE_OUTER]

          const rightX = rightEye.x * canvas.width
          const rightY = rightEye.y * canvas.height
          const leftX = leftEye.x * canvas.width
          const leftY = leftEye.y * canvas.height

          const centerX = (leftX + rightX) / 2
          const centerY = (leftY + rightY) / 2
          const eyeDistance = Math.hypot(leftX - rightX, leftY - rightY)
          const angle = Math.atan2(leftY - rightY, leftX - rightX)

          const glassesWidth = eyeDistance * 2.1
          const glassesHeight =
            glassesWidth * (glassesImage.naturalHeight / glassesImage.naturalWidth)

          ctx.save()
          ctx.translate(centerX, centerY)
          ctx.rotate(angle)
          ctx.drawImage(
            glassesImage,
            -glassesWidth / 2,
            -glassesHeight / 2,
            glassesWidth,
            glassesHeight
          )
          ctx.restore()
        }
      }

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
  }

  function handleClose() {
    stopEverything()
    onClose()
  }

  const showIntro = stage === 'idle' || stage === 'loading-model' || stage === 'requesting-camera'

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in-scale">
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Close"
      >
        <X className="h-7 w-7" />
      </button>

      <div className="text-center max-w-md mx-auto w-full">
        {stage === 'idle' ? (
          <div
            className="relative mb-6 rounded-2xl overflow-hidden mx-auto aspect-square"
            style={{ maxWidth: '360px' }}
          >
            <Image
              src={imageUrl}
              alt={productName}
              fill
              unoptimized
              className="object-cover opacity-40"
            />
            <button
              onClick={handleStart}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/20 hover:bg-black/30 transition-colors"
            >
              <span className="bg-blue-700 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Start Camera
              </span>
            </button>
          </div>
        ) : (
          showIntro && (
            <div className="relative mb-6">
              <div className="w-36 h-36 rounded-full border-4 border-blue-500/50 flex items-center justify-center mx-auto relative">
                <div className="absolute inset-0 rounded-full border-4 border-blue-400/20 animate-ping" />
                <div className="bg-blue-700/30 rounded-full p-6">
                  <Camera className="h-16 w-16 text-blue-400" />
                </div>
              </div>
            </div>
          )
        )}

        {showIntro && (
          <>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Virtual Try-On</h2>
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>

            <p className="text-gray-400 text-sm mb-1 font-medium">{productName}</p>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Point your camera at your face to try on these glasses
            </p>
          </>
        )}

        {(stage === 'loading-model' || stage === 'requesting-camera') && (
          <div className="bg-white/10 border border-white/20 rounded-xl p-5 text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <p className="text-yellow-300 font-medium text-sm">
                {stage === 'loading-model' ? 'Preparing AR experience' : 'Waiting for camera permission'}
              </p>
            </div>
            <div className="mt-1 bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    modelReady ? 'bg-green-400' : 'bg-blue-400 animate-pulse'
                  }`}
                />
                Face landmark model: {modelReady ? 'Ready' : 'Loading...'}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    cutoutReady ? 'bg-green-400' : 'bg-blue-400 animate-pulse'
                  }`}
                />
                Glasses cutout: {cutoutReady ? 'Ready' : 'Removing background...'}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    stage === 'requesting-camera' ? 'bg-blue-400 animate-pulse' : 'bg-gray-500'
                  }`}
                />
                Camera stream: {stage === 'requesting-camera' ? 'Requesting...' : 'Waiting...'}
              </div>
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-left">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <p className="text-red-300 font-medium text-sm">Couldn&apos;t start try-on</p>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">{errorMessage}</p>
            <button
              onClick={handleStart}
              className="bg-blue-700 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        <div
          className={`relative mx-auto rounded-2xl overflow-hidden bg-black ${
            stage === 'running' ? 'block' : 'hidden'
          }`}
          style={{ maxWidth: '480px' }}
        >
          <video ref={videoRef} muted playsInline className="absolute w-px h-px opacity-0 pointer-events-none" />
          <canvas ref={canvasRef} className="w-full h-auto" style={{ transform: 'scaleX(-1)' }} />
        </div>

        {stage === 'running' && <p className="text-white font-medium mt-4">{productName}</p>}

        <p className="text-gray-600 text-xs mt-6">
          Camera access required &bull; No data is stored or transmitted
        </p>
      </div>
    </div>
  )
}
