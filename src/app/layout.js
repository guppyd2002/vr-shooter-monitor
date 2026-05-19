import './globals.css'

export const metadata = {
  title: 'VR Shooter Monitor',
  description: 'VR Shooter 專案 Monitor Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
