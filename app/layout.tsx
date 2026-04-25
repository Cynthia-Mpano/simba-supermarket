import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { StoreProvider } from '@/lib/store-context'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: "Simba Supermarket - Rwanda's #1 Online Supermarket",
  description: 'Shop fresh groceries, household essentials, and more. Fast delivery in Kigali, Rwanda. MoMo payments accepted.',
  keywords: ['supermarket', 'groceries', 'Rwanda', 'Kigali', 'online shopping', 'delivery', 'MoMo'],
  authors: [{ name: 'Simba Supermarket' }],
  openGraph: {
    title: "Simba Supermarket - Rwanda's #1 Online Supermarket",
    description: 'Shop fresh groceries, household essentials, and more. Fast delivery in Kigali.',
    type: 'website',
    locale: 'en_RW',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f97316' },
    { media: '(prefers-color-scheme: dark)', color: '#fb923c' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        <StoreProvider>
          {children}
        </StoreProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
