"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import "../../../AdminAgendamento.css"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://barbeariasite.onrender.com"

export default function AdminPage() {
    const [agendamentos, setAgendamentos] = useState([])
    const [loading, setLoading] = useState(true)
    const [filtroStatus, setFiltroStatus] = useState("todos")
    const [modalAgendamento, setModalAgendamento] = useState(null)
    const [modalExcluir, setModalExcluir] = useState(null)
    const [dataInicio, setDataInicio] = useState("")
    const [dataFim, setDataFim] = useState("")
    const router = useRouter()

    useEffect(() => {
        buscarAgendamentos()
    }, [])

    const buscarAgendamentos = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            alert("Você precisa estar logado para acessar o painel administrativo.")
            router.push("/login")
            return
        }

        try {
            const response = await fetch(`${API_URL}/api/Agendamento/todos-admin`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (response.ok) {
                const data = await response.json()
                setAgendamentos(data)
            } else {
                console.error("Erro ao buscar agendamentos")
            }
        } catch (error) {
            console.error("Erro ao buscar agendamentos:", error)
        } finally {
            setLoading(false)
        }
    }

    const confirmarConclusao = async () => {
        if (!modalAgendamento) return
        const token = localStorage.getItem("token")

        try {
            const response = await fetch(`${API_URL}/api/Agendamento/concluir/${modalAgendamento.id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            })

            if (response.ok) {
                setModalAgendamento(null)
                buscarAgendamentos()
            } else {
                const txt = await response.text()
                console.error("Erro ao concluir agendamento:", txt)
            }
        } catch (error) {
            console.error("Erro ao concluir agendamento:", error)
        }
    }

    const confirmarExclusao = async () => {
        if (!modalExcluir) return
        const token = localStorage.getItem("token")

        try {
            const response = await fetch(`${API_URL}/api/Agendamento/${modalExcluir.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })

            if (response.ok) {
                setModalExcluir(null)
                buscarAgendamentos()
            } else {
                const txt = await response.text()
                console.error("Erro ao excluir agendamento:", txt)
            }
        } catch (error) {
            console.error("Erro ao excluir agendamento:", error)
        }
    }

    const aplicarFiltroData = (lista) => {
        if (!dataInicio && !dataFim) return lista

        return lista.filter((ag) => {
            const dataAg = new Date(ag.dataHora)
            const inicio = dataInicio ? new Date(dataInicio) : null
            const fim = dataFim ? new Date(dataFim) : null

            if (inicio && dataAg < inicio) return false
            if (fim && dataAg > fim) return false
            return true
        })
    }

    const agendamentosFiltrados = aplicarFiltroData(
        agendamentos.filter((ag) => {
            if (filtroStatus === "todos") return true
            if (filtroStatus === "pendente") return !ag.confirmado
            if (filtroStatus === "confirmado") return ag.confirmado
            return true
        })
    )

    const stats = {
        total: agendamentos.length,
        confirmados: agendamentos.filter((a) => a.confirmado).length,
        pendentes: agendamentos.filter((a) => !a.confirmado).length,
        receita: agendamentos.reduce((sum, a) => sum + (a.precoFinal || 0), 0),
    }

    const formatarData = (dataString) => new Date(dataString).toLocaleDateString("pt-BR")
    const formatarHora = (dataString) =>
        new Date(dataString).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

    return (
        <div className="admin-container">
            <header className="admin-header">
                <button className="admin-back-btn" onClick={() => router.push("/dashboard")}>
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
                        <p className="stat-label">Total</p>
                        <p className="stat-value">{stats.total}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <p className="stat-label">Confirmados</p>
                        <p className="stat-value">{stats.confirmados}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                        <p className="stat-label">Pendentes</p>
                        <p className="stat-value">{stats.pendentes}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <p className="stat-label">Receita</p>
                        <p className="stat-value">R$ {stats.receita.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="admin-filters">
                <button className={`filter-btn ${filtroStatus === "todos" ? "active" : ""}`} onClick={() => setFiltroStatus("todos")}>
                    Todos ({stats.total})
                </button>
                <button className={`filter-btn ${filtroStatus === "pendente" ? "active" : ""}`} onClick={() => setFiltroStatus("pendente")}>
                    Pendentes ({stats.pendentes})
                </button>
                <button className={`filter-btn ${filtroStatus === "confirmado" ? "active" : ""}`} onClick={() => setFiltroStatus("confirmado")}>
                    Confirmados ({stats.confirmados})
                </button>

                <div className="date-filter">
                    <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                    <span>até</span>
                    <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                </div>
            </div>

            {loading ? (
                <div className="admin-loading">Carregando agendamentos...</div>
            ) : agendamentosFiltrados.length === 0 ? (
                <div className="admin-empty">Nenhum agendamento encontrado</div>
            ) : (
                <div className="admin-appointments">
                    {agendamentosFiltrados.map((agendamento) => (
                        <div key={agendamento.id} className="appointment-card">
                            <div className="appointment-header">
                                <h3 className="appointment-service">{agendamento.servico?.nome || "Serviço"}</h3>
                                <span className={`appointment-status ${agendamento.confirmado ? "status-confirmado" : "status-pendente"}`}>
                                    {agendamento.confirmado ? "Confirmado" : "Pendente"}
                                </span>
                            </div>
                            <div className="appointment-details">
                                <div className="detail-row">
                                    <span className="detail-label">Cliente:</span>
                                    <span className="detail-value">{agendamento.cliente?.nome || "N/A"}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Barbeiro:</span>
                                    <span className="detail-value">{agendamento.proprietario?.nome || "N/A"}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Data:</span>
                                    <span className="detail-value">{formatarData(agendamento.dataHora)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Horário:</span>
                                    <span className="detail-value">{formatarHora(agendamento.dataHora)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Preço:</span>
                                    <span className="detail-value price">R$ {(agendamento.precoFinal || 0).toFixed(2)}</span>
                                </div>
                                {agendamento.observacao && (
                                    <div className="detail-row">
                                        <span className="detail-label">Obs:</span>
                                        <span className="detail-value">{agendamento.observacao}</span>
                                    </div>
                                )}

                                <div className="button-group">
                                    {!agendamento.confirmado && (
                                        <button className="concluir-btn" onClick={() => setModalAgendamento(agendamento)}>
                                            ✅ Concluir
                                        </button>
                                    )}
                                    <button className="excluir-btn" onClick={() => setModalExcluir(agendamento)}>
                                        <span>🗑️</span> Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Concluir */}
            {modalAgendamento && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>Concluir Agendamento</h3>
                        <p>
                            Deseja realmente marcar o agendamento de <strong>{modalAgendamento.cliente?.nome}</strong> como concluído?
                        </p>
                        <div className="modal-actions">
                            <button className="cancelar-btn" onClick={() => setModalAgendamento(null)}>Cancelar</button>
                            <button className="confirmar-btn" onClick={confirmarConclusao}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Excluir */}
            {modalExcluir && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>Excluir Agendamento</h3>
                        <p>
                            Tem certeza que deseja <strong>excluir</strong> o agendamento de{" "}
                            <strong>{modalExcluir.cliente?.nome}</strong>?
                        </p>
                        <div className="modal-actions">
                            <button className="cancelar-btn" onClick={() => setModalExcluir(null)}>Cancelar</button>
                            <button className="confirmar-btn" onClick={confirmarExclusao}>Excluir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
