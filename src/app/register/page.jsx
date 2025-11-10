"use client"

import { useState } from "react"
import { FiEye, FiEyeOff } from "react-icons/fi" // 👈 ÍCONES MAIS DISCRETOS
import "../../barber.css"

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
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    // ✅ Máscara de telefone dinâmica
    const handleTelefoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, "")
        if (value.length > 11) value = value.slice(0, 11)
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
        }
        setTelefone(value)
    }

    // ✅ Validação de senha forte
    const validarSenha = (senha) => {
        const temMaiuscula = /[A-Z]/.test(senha)
        const temNumero = /\d/.test(senha)
        const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(senha)
        return temMaiuscula && temNumero && temEspecial
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (password !== confirm) {
            setError("As senhas não coincidem!")
            return
        }

        if (!validarSenha(password)) {
            setError("A senha deve conter pelo menos uma letra maiúscula, um número e um caractere especial.")
            return
        }

        try {
            setLoading(true)
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nomeCompleto: name,
                    email,
                    password,
                    telefone
                }),
            })

            if (!res.ok) throw new Error("Erro ao cadastrar")

            setSuccess("✅ Cadastro realizado com sucesso!")
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

                    {/* TELEFONE */}
                    <div className="form-group">
                        <label className="form-label">Telefone</label>
                        <input
                            type="text"
                            className="barber-input"
                            placeholder="(11) 99999-9999"
                            value={telefone}
                            onChange={handleTelefoneChange}
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

                    <div className="form-group" style={{ position: "relative" }}>
                        <label className="form-label">Confirmar senha</label>
                        <input
                            type={showConfirm ? "text" : "password"}
                            className="barber-input"
                            placeholder="••••••••"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                        />
                        <span
                            onClick={() => setShowConfirm(!showConfirm)}
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
                            {showConfirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </span>
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <button type="submit" className="barber-button" disabled={loading}>
                        {loading ? "Cadastrando..." : "Cadastrar"}
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
