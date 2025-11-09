"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../../AdminPage.css"

export default function AdminPage() {
    const [agendamentos, setAgendamentos] = useState([])
    const [loading, setLoading] = useState(true)
    const [filtroStatus, setFiltroStatus] = useState("todos")
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            alert("Faça login para acessar o painel.")
            navigate("/login")
            return
        }

        // confere role no token
        try {
            const payload = JSON.parse(atob(token.split(".")[1]))
            const role =
                payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || ""

            if (role !== "Proprietario") {
                alert("Acesso restrito aos proprietários.")
                navigate("/dashboard")
                return
            }
        } catch {
            // caso token inválido
            navigate("/login")
            return
        }

        buscarAgendamentos()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const buscarAgendamentos = async () => {
        const token = localStorage.getItem("token")
        setLoading(true)
        try {
            // use o endpoint de admin protegido
            const res = await fetch("https://localhost:7037/api/Agendamento/todos-admin", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    alert("Sessão expirada ou sem permissão.")
                    navigate("/login")
                    return
                }
                const txt = await res.text()
                throw new Error(txt || "Falha ao carregar agendamentos")
            }

            const data = await res.json()

            // normaliza para o formato esperado na UI
            const normalizados = (Array.isArray(data) ? data : []).map((a) => ({
                id: a.id,
                servicoNome: a.servico?.nome || "Serviço",
                clienteNome: a.cliente?.nome || "N/A",
                proprietarioNome: a.proprietario?.nome || "N/A",
                dataHora: a.dataHora,
                precoFinal: a.precoFinal ?? 0,
                observacoes: a.observacao ?? "",
                status: a.confirmado ? "Confirmado" : "Pendente",
            }))

            setAgendamentos(normalizados)
        } catch (err) {
            console.error("Erro ao buscar agendamentos:", err)
            alert("Erro ao carregar agendamentos.")
        } finally {
            setLoading(false)
        }
    }

    const agendamentosFiltrados = agendamentos.filter((ag) => {
        if (filtroStatus === "todos") return true
        return ag.status?.toLowerCase() === filtroStatus
    })

    const stats = {
        total: agendamentos.length,
        confirmados: agendamentos.filter((a) => a.status?.toLowerCase() === "confirmado")
            .length,
        pendentes: agendamentos.filter((a) => a.status?.toLowerCase() === "pendente")
            .length,
        receita: agendamentos.reduce((sum, a) => sum + (a.precoFinal || 0), 0),
    }

    const formatarData = (dataString) => {
        const data = new Date(dataString)
        return data.toLocaleDateString("pt-BR")
    }

    const formatarHora = (dataString) => {
        const data = new Date(dataString)
        return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }

    return (
        <div className="admin-container">
            <header className="admin-header">
                <button className="admin-back-btn" onClick={() => navigate("/dashboard")}>
                    ← Voltar
                </button>
                <div>
                    <h1 className="admin-title">Painel Administrativo</h1>
                    <p className="admin-subtitle">Gerencie todos os agendamentos da barbearia</p>
                </div>
            </header>

            <div className="admin-stats">
                <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-info">
                        <span className="stat-label">Total de Agendamentos</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <span className="stat-label">Confirmados</span>
                        <span className="stat-value">{stats.confirmados}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                        <span className="stat-label">Pendentes</span>
                        <span className="stat-value">{stats.pendentes}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <span className="stat-label">Receita Total</span>
                        <span className="stat-value">R$ {stats.receita.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="admin-filters">
                <button
                    className={`filter-btn ${filtroStatus === "todos" ? "active" : ""}`}
                    onClick={() => setFiltroStatus("todos")}
                >
                    Todos ({stats.total})
                </button>
                <button
                    className={`filter-btn ${filtroStatus === "pendente" ? "active" : ""}`}
                    onClick={() => setFiltroStatus("pendente")}
                >
                    Pendentes ({stats.pendentes})
                </button>
                <button
                    className={`filter-btn ${filtroStatus === "confirmado" ? "active" : ""}`}
                    onClick={() => setFiltroStatus("confirmado")}
                >
                    Confirmados ({stats.confirmados})
                </button>
            </div>

            {loading ? (
                <div className="admin-loading">Carregando agendamentos...</div>
            ) : agendamentosFiltrados.length === 0 ? (
                <div className="admin-empty">
                    <p>Nenhum agendamento encontrado</p>
                </div>
            ) : (
                <div className="admin-appointments">
                    {agendamentosFiltrados.map((ag) => (
                        <div key={ag.id} className="appointment-card">
                            <div className="appointment-header">
                                <h3 className="appointment-service">{ag.servicoNome}</h3>
                                <span
                                    className={`appointment-status status-${ag.status?.toLowerCase() || "pendente"
                                        }`}
                                >
                                    {ag.status}
                                </span>
                            </div>

                            <div className="appointment-details">
                                <div className="detail-row">
                                    <span className="detail-label">Cliente:</span>
                                    <span className="detail-value">{ag.clienteNome}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Barbeiro:</span>
                                    <span className="detail-value">{ag.proprietarioNome}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Data:</span>
                                    <span className="detail-value">{formatarData(ag.dataHora)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Horário:</span>
                                    <span className="detail-value">{formatarHora(ag.dataHora)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Preço:</span>
                                    <span className="detail-value price">
                                        R$ {ag.precoFinal?.toFixed(2) || "0.00"}
                                    </span>
                                </div>
                                {ag.observacoes && (
                                    <div className="detail-row">
                                        <span className="detail-label">Observações:</span>
                                        <span className="detail-value">{ag.observacoes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
