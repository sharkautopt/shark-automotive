import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// One family, all weights, per the design spec. font-mono/font-display keep
// their CSS variable names (many components already use those classes) but
// all three now point at the same Inter instance.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Shark Automotive | Importação Premium de Veículos da Alemanha e Bélgica',
    template: '%s | Shark Automotive'
  },
  description: 'Importação de veículos premium da Alemanha e Bélgica para Portugal. Verificação técnica documentada, total transparência e dossier técnico completo. Zero Conversas. Total Transparência.',
  keywords: [
    'importação automóvel',
    'carros alemanha',
    'carros bélgica',
    'importação premium',
    'veículos usados premium',
    'BMW',
    'Mercedes-Benz',
    'Porsche',
    'Audi',
    'Portugal',
    'Lisboa',
    'Porto'
  ],
  authors: [{ name: 'Shark Automotive' }],
  creator: 'Shark Automotive',
  publisher: 'Shark Automotive',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sharkautomotive.pt'),
  alternates: {
    canonical: '/',
    languages: {
      'pt-PT': '/pt',
      'en': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://sharkautomotive.pt',
    siteName: 'Shark Automotive',
    title: 'Shark Automotive | Importação Premium de Veículos',
    description: 'Importação de veículos premium da Alemanha e Bélgica. Verificação técnica documentada e total transparência.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Shark Automotive - Importação Premium',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shark Automotive | Importação Premium de Veículos',
    description: 'Importação de veículos premium da Alemanha e Bélgica. Zero Conversas. Total Transparência.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/images/shark-fin-logo.png', type: 'image/png' },
    ],
    apple: '/images/shark-fin-logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a111c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" className={inter.variable}>
      <body className="font-sans antialiased bg-background">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
