import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Geovisor AE — Amazonia colombiana',
  description: 'Visualización espacial de procesos de restauración y conservación en la Amazonia colombiana',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full bg-gray-950 text-white antialiased">
        {children}
      </body>
    </html>
  )
}
