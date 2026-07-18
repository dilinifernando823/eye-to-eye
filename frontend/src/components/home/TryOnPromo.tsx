import Link from 'next/link'
import { Camera, Sparkles, CheckCircle } from 'lucide-react'

const features = [
  'No app download needed',
  'Works on any modern browser',
  'Try unlimited frames instantly',
]

export default function TryOnPromo() {
  return (
    <section className="py-16 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-5">
              <Sparkles className="h-4 w-4" />
              New Feature
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Try Before You Buy
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Use our Virtual Try-On feature to see how any frame looks on your face — right
              from your camera, no app needed.
            </p>
            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/spectacles"
              className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-800 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <Camera className="h-5 w-5" />
              Try It Now
            </Link>
          </div>

          {/* Right — visual */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-72 h-72 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl flex items-center justify-center shadow-2xl">
                {/* Simulated camera overlay */}
                <div className="relative w-56 h-56">
                  {/* Face outline */}
                  <div className="absolute inset-0 border-4 border-white/30 rounded-full" />
                  {/* Corner markers */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-sky-300 rounded-tl-lg" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-sky-300 rounded-tr-lg" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-sky-300 rounded-bl-lg" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-sky-300 rounded-br-lg" />
                  {/* Glasses overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 200 100" className="w-40" fill="none">
                      <path d="M80 50 Q100 43 120 50" stroke="rgba(255,255,255,0.9)" strokeWidth="4" strokeLinecap="round" />
                      <rect x="10" y="25" width="64" height="50" rx="15" stroke="rgba(255,255,255,0.9)" strokeWidth="4" fill="rgba(135,206,235,0.2)" />
                      <rect x="126" y="25" width="64" height="50" rx="15" stroke="rgba(255,255,255,0.9)" strokeWidth="4" fill="rgba(135,206,235,0.2)" />
                    </svg>
                  </div>
                  {/* Scan indicator */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-sky-300/60 animate-pulse" />
                </div>
              </div>
              {/* Float label */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-blue-800 font-bold text-sm px-6 py-2 rounded-full shadow-lg whitespace-nowrap">
                AI-Powered Fit
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
