"use client"

import { use, useState } from "react"
import "../../barber.css"
import { te } from "date-fns/locale/te"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://barbeariasite.onrender.com"


function Register() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [telefone, setTelefone] = useState("")
    const [confirm, setConfirm] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (password !== confirm) {
            setError("As senhas não coincidem!")
            return
        }

        try {
            setLoading(true)
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nomeCompleto: name, email, password, telefone }),
            })

            if (!res.ok) throw new Error("Erro ao cadastrar")

            setSuccess("Cadastro realizado com sucesso!")
            setTimeout(() => (window.location.href = "/login"), 1500)
        } catch {
            setError("Erro ao cadastrar. Tente novamente.")
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

                <h2 className="welcome-text">Criar Conta</h2>
                <p className="welcome-subtitle">Cadastre-se para começar a usar o sistema</p>

                <form onSubmit={handleSubmit} className="barber-form">
                    <div className="form-group">
                        <label className="form-label">Nome completo</label>
                        <input
                            type="text"
                            className="barber-input"
                            placeholder="Ex: João da Silva"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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

                    <div className="form-group">
                        <label className="form-label">Telefone</label>
                        <input
                            type="number"
                            className="barber-input"
                            placeholder="Seu telefone:"
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Senha</label>
                        <input
                            type="password"
                            className="barber-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirmar senha</label>
                        <input
                            type="password"
                            className="barber-input"
                            placeholder="••••••••"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <button type="submit" className="barber-button" disabled={loading}>
                        <span>{loading ? "Cadastrando..." : "Cadastrar"}</span>
                    </button>
                </form>

                <p className="footer-text">
                    Já possui conta?{" "}
                    <a href="/login" className="footer-link">
                        Entrar
                    </a>
                </p>
            </div>
        </div>
    )
}

export default Register
