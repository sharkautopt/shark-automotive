import type { Metadata, Viewport } from 'next'
import { DM_Sans, DM_Mono, Bebas_Neue } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const dmMono = DM_Mono({ 
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({ 
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Shark Automotive | Importação Premium de Veículos da Alemanha e Bélgica',
    template: '%s | Shark Automotive'
  },
  description: 'Importação de veículos premium da Alemanha e Bélgica para Portugal. Protocolo de inspeção 150 pontos, total transparência, dossier técnico completo. Zero Conversas. Total Transparência.',
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
    description: 'Importação de veículos premium da Alemanha e Bélgica. Protocolo 150 pontos, total transparência.',
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
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0f23',
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
    <html lang="pt" className={`${dmSans.variable} ${dmMono.variable} ${bebasNeue.variable}`}>
      <body className="font-sans antialiased bg-background">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
