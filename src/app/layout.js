import "../globals.css"

export const metadata = {
  title: "HeadShip",
  description: "Sistema de agendamento",
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
