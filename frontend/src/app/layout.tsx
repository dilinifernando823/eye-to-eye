import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ChatbotWidget from '@/components/ai/ChatbotWidget'
import QueryProvider from '@/components/providers/QueryProvider'

export const metadata: Metadata = {
  title: 'Eye To Eye Opticians | Premium Eyewear in Sri Lanka',
  description:
    'Shop prescription spectacles, sunglasses, and contact lenses online. Book your eye test today at Eye To Eye Opticians.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white">
        <QueryProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatbotWidget />
        </QueryProvider>
      </body>
    </html>
  )
}
