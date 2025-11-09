import "../globals.css"

export const metadata = {
  title: "Barbearia Premium",
  description: "Sistema de agendamento",
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
