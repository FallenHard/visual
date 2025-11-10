"use client"

import { useState } from "react"
import { FiEye, FiEyeOff } from "react-icons/fi" // 👈 ícones elegantes
import "../../barber.css"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://barbeariasite.onrender.com"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false) // 👈 controle de visibilidade

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            if (!res.ok) throw new Error("Falha no login")

            const data = await res.json()

            // Salva token no localStorage e cookie
            localStorage.setItem("token", data.token)
            document.cookie = `token=${data.token}; path=/; secure; samesite=strict`

            window.location.href = "/dashboard"

        } catch {
            setError("Email ou senha incorretos.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="barber-container">
            <div className="barber-card">
                <div className="barber-logo">
                    <div className="scissors-icon">✂</div>
                    <h1 className="barber-title">Barbearia Premium</h1>
                    <p className="barber-subtitle">Estilo e Tradição</p>
                </div>

                <h2 className="welcome-text">Bem-vindo de volta</h2>
                <p className="welcome-subtitle">Faça login para acessar sua conta</p>

                <form onSubmit={handleSubmit} className="barber-form">
                    {/* EMAIL */}
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="barber-input"
                            placeholder="seuemail@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* SENHA COM OLHO */}
                    <div className="form-group" style={{ position: "relative" }}>
                        <label className="form-label">Senha</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="barber-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: "absolute",
                                right: "12px",
                                top: "35px",
                                cursor: "pointer",
                                color: "#bfa14a",
                                opacity: 0.8,
                                transition: "opacity 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.8)}
                        >
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </span>
                    </div>

                    {/* MENSAGEM DE ERRO */}
                    {error && <p className="error-message">{error}</p>}

                    {/* BOTÃO */}
                    <button type="submit" className="barber-button" disabled={loading}>
                        <span>{loading ? "Entrando..." : "Entrar"}</span>
                    </button>
                </form>

                <p className="footer-text">
                    Ainda não tem conta?{" "}
                    <a href="/register" className="footer-link">
                        Cadastre-se
                    </a>
                </p>
            </div>
        </div>
    )
}
