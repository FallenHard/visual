"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import "../../barber.css"
import "../../dashboard.css"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://barbeariasite.onrender.com"


export default function Dashboard() {
    // ALTERAÇÃO: Inicializa como "novo"
    const [activeTab, setActiveTab] = useState("novo")
    const [servicos, setServicos] = useState([])
    const [barbeiros, setBarbeiros] = useState([])
    const [agendamentos, setAgendamentos] = useState([])
    const [role, setRole] = useState("")
    const [toastMessage, setToastMessage] = useState("")
    const router = useRouter()

    // 🌟 NOVO ESTADO: Controla a abertura do menu hambúrguer/configurações
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    const [formData, setFormData] = useState({
        servicoId: "",
        proprietarioId: "",
        observacao: "",
    })
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [selectedTime, setSelectedTime] = useState("")

    const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false)
    const [servicoParaExcluir, setServicoParaExcluir] = useState(null)

    // 🔹 Estados para CRUD de serviços
    const [mostrarModalServico, setMostrarModalServico] = useState(false)
    const [novoServico, setNovoServico] = useState({ nome: "", preco: "" })
    const [servicoEditando, setServicoEditando] = useState(null)

    const horariosDisponiveis = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
        "17:00", "17:30", "18:00", "18:30"
    ]

    useEffect(() => {
        carregarDados()
    }, [])

    const carregarDados = async () => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push("/login")
            return
        }

        try {
            const decoded = JSON.parse(atob(token.split(".")[1]))
            const userRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || ""
            setRole(userRole)

            const [servicosRes, barbeirosRes, agRes] = await Promise.all([
                fetch(`${API_URL}/api/Servicos/todos`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/api/Proprietarios/todos`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/api/Agendamento/todos`, { headers: { Authorization: `Bearer ${token}` } }),
            ])

            if (servicosRes.ok) setServicos(await servicosRes.json())
            if (barbeirosRes.ok) setBarbeiros(await barbeirosRes.json())
            if (agRes.ok) setAgendamentos(await agRes.json())
        } catch (error) {
            console.error("Erro ao carregar dados:", error)
        }
    }

    const mostrarToast = (msg) => {
        setToastMessage(msg)
        setTimeout(() => setToastMessage(""), 3000)
    }

    const handleLogout = () => {
        localStorage.removeItem("token") // remove o token do usuário
        router.push("/login") // redireciona para a tela de login
    }

    // NOVO: Função para mudar para Meus Agendamentos e fechar o menu
    const handleMeusAgendamentos = () => {
        setActiveTab("meus")
        setIsSettingsOpen(false)
    }

    // 🔹 Verifica se horário está ocupado
    const horarioOcupado = (horario) => {
        if (!formData.proprietarioId) return false
        const [horaDesejada, minutoDesejado] = horario.split(":").map(Number)
        const dataSelecionada = selectedDate.toISOString().split("T")[0]

        return agendamentos.some((a) => {
            if (a.proprietario?.id !== parseInt(formData.proprietarioId)) return false
            const dataAgendamento = new Date(a.dataHora)
            const dataAgendada = dataAgendamento.toISOString().split("T")[0]
            const horaAgendada = dataAgendamento.getUTCHours()
            const minutoAgendado = dataAgendamento.getUTCMinutes()

            return (
                dataSelecionada === dataAgendada &&
                horaAgendada === horaDesejada &&
                minutoAgendado === minutoDesejado
            )
        })
    }

    // 🔹 Criar agendamento
    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = localStorage.getItem("token")
        if (!token) {
            mostrarToast("⚠️ Você precisa estar logado para agendar.")
            return
        }

        const servicoSelecionado = servicos.find((s) => s.id === parseInt(formData.servicoId))
        if (!servicoSelecionado) return mostrarToast("⚠️ Selecione um serviço válido.")
        if (!selectedTime) return mostrarToast("⚠️ Selecione um horário válido.")

        const dataHoraCompleta = `${selectedDate.toISOString().split("T")[0]}T${selectedTime}:00Z`
        const agendamentoDto = {
            proprietarioId: parseInt(formData.proprietarioId),
            servicoId: parseInt(formData.servicoId),
            dataHora: dataHoraCompleta,
            observacao: formData.observacao || "",
            precoFinal: parseFloat(servicoSelecionado.preco || 0),
            confirmado: false,
        }

        try {
            const res = await fetch(`${API_URL}/api/Agendamento/criar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(agendamentoDto),
            })

            if (!res.ok) {
                const txt = await res.text()
                mostrarToast(`❌ Erro: ${txt || res.statusText}`)
                return
            }

            mostrarToast("✅ Agendamento criado com sucesso!")
            setFormData({ servicoId: "", proprietarioId: "", observacao: "" })
            setSelectedTime("")
            carregarDados()
            setActiveTab("meus")
        } catch (error) {
            console.error("Erro ao criar agendamento:", error)
            mostrarToast("❌ Erro ao realizar agendamento.")
        }
    }

    // 🔹 CRUD de serviços
    const handleAdicionarServico = async (e) => {
        e.preventDefault()
        const token = localStorage.getItem("token")
        if (!novoServico.nome.trim() || !novoServico.preco)
            return mostrarToast("⚠️ Preencha nome e preço.")

        try {
            const res = await fetch(`${API_URL}/api/Servicos/criar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nome: novoServico.nome,
                    preco: parseFloat(novoServico.preco),
                }),
            })
            if (res.ok) {
                mostrarToast("✅ Serviço criado com sucesso!")
                setNovoServico({ nome: "", preco: "" })
                setMostrarModalServico(false)
                carregarDados()
            } else mostrarToast("❌ Erro ao criar serviço.")
        } catch (error) {
            console.error(error)
            mostrarToast("❌ Falha ao conectar com o servidor.")
        }
    }

    const excluirServico = async (id) => {
        const token = localStorage.getItem("token")
        if (!confirm("Deseja realmente excluir este serviço?")) return
        try {
            const res = await fetch(`${API_URL}/api/Servicos/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                mostrarToast("🗑️ Serviço excluído!")
                carregarDados()
            } else mostrarToast("❌ Erro ao excluir serviço.")
        } catch (error) {
            console.error(error)
        }
    }

    const salvarEdicaoServico = async (e) => {
        e.preventDefault()
        const token = localStorage.getItem("token")
        try {
            const res = await fetch(`${API_URL}/api/Servicos/${servicoEditando.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(servicoEditando),
            })
            if (res.ok) {
                mostrarToast("💾 Serviço atualizado!")
                setServicoEditando(null)
                carregarDados()
            } else mostrarToast("❌ Erro ao salvar alterações.")
        } catch (error) {
            console.error(error)
        }
    }
    const renderCalendario = () => {
        const hoje = new Date()
        const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
        const primeiroDia = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
        const ultimoDia = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
        const dias = []
        const diaInicial = primeiroDia.getDay()

        for (let i = 0; i < diaInicial; i++)
            dias.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)

        for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
            const dataAtual = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), dia)
            const isSelected = dataAtual.toDateString() === selectedDate.toDateString()
            const isPast = dataAtual < hoje.setHours(0, 0, 0, 0)

            dias.push(
                <div
                    key={dia}
                    className={`calendar-day ${isSelected ? "selected" : ""} ${isPast ? "past" : ""}`}
                    onClick={() => !isPast && setSelectedDate(dataAtual)}
                >
                    {dia}
                </div>
            )
        }

        return (
            <div className="calendar-container fixed-calendar">
                <div className="calendar-header">
                    <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))} className="calendar-nav">←</button>
                    <h3>{selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h3>
                    <button onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))} className="calendar-nav">→</button>
                </div>
                <div className="calendar-weekdays">
                    {diasSemana.map((dia) => <div key={dia} className="weekday">{dia}</div>)}
                </div>
                <div className="calendar-grid">{dias}</div>
            </div>
        )
    }

    return (
        <div className="dashboard-container">
            {/* NOVO HEADER: Focado em centralização e menu hambúrguer */}
            <div className="dashboard-header new-header">
                <div className="dashboard-header-center">
                    <h1 className="dashboard-title">Agendamentos</h1>
                    <p className="dashboard-subtitle">Agende seu horário com os melhores profissionais</p>
                </div>

                <div className="dashboard-header-right">
                    <div className="hamburger-menu-wrapper">
                        <button
                            className={`hamburger-icon-btn ${isSettingsOpen ? 'open' : ''}`}
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            aria-label="Menu de Opções"
                        >
                            {/* Ícone Hambúrguer (pode ser um ícone de três barras, como no seu print) */}
                            {/* Você pode substituir este texto por um componente de ícone real (SVG/Image) para o melhor visual */}
                            <div className="hamburger-icon">
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>
                        </button>
                        <div className={`menu-drawer ${isSettingsOpen ? 'open' : ''}`}>
                            <button
                                className={`menu-item ${activeTab === "meus" ? "active" : ""}`}
                                onClick={handleMeusAgendamentos}
                            >
                                Meus Agendamentos
                            </button>
                            <button className="menu-item" onClick={handleLogout}>
                                Sair
                            </button>
                            {role === "Proprietario" && (
                                <button className="menu-item admin-link" onClick={() => router.push("/admin/agendamentos")}>
                                    📋 Ver Todos (Admin)
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* NOVO BLOCO DE ABAS: Apenas "Novo Agendamento" fica aqui */}
            <div className="dashboard-tabs centered-tabs">
                <button
                    className={`tab-button ${activeTab === "novo" ? "active" : ""}`}
                    onClick={() => { setActiveTab("novo"); setIsSettingsOpen(false); }}
                >
                    Novo Agendamento
                </button>
                {/* O botão "Meus Agendamentos" foi movido para o menu hambúrguer */}
            </div>

            {activeTab === "novo" ? (
                <div className="dashboard-content">
                    <div className="booking-grid">

                        {/* 🔹 Serviços */}
                        <div className="booking-section service-section" style={{ position: "relative" }}>
                            <h2 className="section-title">Escolha o Serviço</h2>

                            {/* Botão + aparece dentro do quadrado */}
                            {role.toLowerCase() === "proprietario" && (
                                <button
                                    className="add-service-btn-inside"
                                    onClick={() => setMostrarModalServico(true)}
                                    title="Adicionar novo serviço"
                                >
                                    +
                                </button>
                            )}

                            <div className="services-grid">
                                {servicos.map((servico) => (
                                    <div
                                        key={servico.id}
                                        className={`service-card ${parseInt(formData.servicoId) === servico.id ? "selected" : ""}`}
                                        onClick={() => setFormData({ ...formData, servicoId: servico.id })}
                                        style={{ position: "relative" }}
                                    >
                                        {role.toLowerCase() === "proprietario" && (
                                            <button
                                                className="delete-icon-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    excluirServico(servico.id);
                                                }}
                                                title="Excluir serviço"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                        <h3>{servico.nome}</h3>
                                        <p className="service-price">R$ {(servico.preco || 0).toFixed(2)}</p>
                                    </div>


                                ))}
                            </div>



                            {/* Modal de Novo Serviço */}
                            {mostrarModalServico && (
                                <div className="modal-overlay">
                                    <div className="modal-box">
                                        <h3>Adicionar Novo Serviço</h3>
                                        <form onSubmit={handleAdicionarServico}>
                                            <input
                                                type="text"
                                                placeholder="Nome do serviço"
                                                value={novoServico.nome}
                                                onChange={(e) => setNovoServico({ ...novoServico, nome: e.target.value })}
                                                required
                                            />
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Preço (R$)"
                                                value={novoServico.preco}
                                                onChange={(e) => setNovoServico({ ...novoServico, preco: e.target.value })}
                                                required
                                            />
                                            <div className="modal-actions">
                                                <button type="button" className="cancelar-btn" onClick={() => setMostrarModalServico(false)}>Cancelar</button>
                                                <button type="submit" className="confirmar-btn">Adicionar</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal de Novo Serviço (duplicado no original, mantendo para consistência) */}
                        {mostrarModalServico && (
                            <div className="modal-overlay">
                                <div className="modal-box">
                                    <h3>Adicionar Novo Serviço</h3>
                                    <form onSubmit={handleAdicionarServico}>
                                        <input
                                            type="text"
                                            placeholder="Nome do serviço"
                                            value={novoServico.nome}
                                            onChange={(e) => setNovoServico({ ...novoServico, nome: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Preço (R$)"
                                            value={novoServico.preco}
                                            onChange={(e) => setNovoServico({ ...novoServico, preco: e.target.value })}
                                            required
                                        />
                                        <div className="modal-actions">
                                            <button type="button" className="cancelar-btn" onClick={() => setMostrarModalServico(false)}>Cancelar</button>
                                            <button type="submit" className="confirmar-btn">Adicionar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Modal de Edição de Serviço */}
                        {servicoEditando && (
                            <div className="modal-overlay">
                                <div className="modal-box">
                                    <h3>Editar Serviço</h3>
                                    <form onSubmit={salvarEdicaoServico}>
                                        <input
                                            type="text"
                                            value={servicoEditando.nome}
                                            onChange={(e) => setServicoEditando({ ...servicoEditando, nome: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={servicoEditando.preco}
                                            onChange={(e) => setServicoEditando({ ...servicoEditando, preco: e.target.value })}
                                        />
                                        <div className="modal-actions">
                                            <button type="button" className="cancelar-btn" onClick={() => setServicoEditando(null)}>Cancelar</button>
                                            <button type="submit" className="confirmar-btn">Salvar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* 🔹 Resto do formulário */}
                        <div className="booking-section">
                            <h2 className="section-title">Escolha o Barbeiro</h2>
                            <div className="barbers-grid">
                                {barbeiros.map((b) => (
                                    <div
                                        key={b.id}
                                        className={`barber-card ${parseInt(formData.proprietarioId) === b.id ? "selected" : ""}`}
                                        onClick={() => setFormData({ ...formData, proprietarioId: b.id })}
                                    >
                                        <div className="barber-avatar">{b.nome?.charAt(0) || "?"}</div>
                                        <h3>{b.nome}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="booking-section">
                            <h2 className="section-title">Escolha a Data</h2>
                            {renderCalendario()}
                        </div>

                        <div className="booking-section">
                            <h2 className="section-title">Escolha o Horário</h2>
                            <div className="time-grid">
                                {horariosDisponiveis.map((horario) => {
                                    const ocupado = horarioOcupado(horario)
                                    return (
                                        <button
                                            key={horario}
                                            className={`time-slot ${selectedTime === horario ? "selected" : ""} ${ocupado ? "disabled" : ""}`}
                                            onClick={() => !ocupado && setSelectedTime(horario)}
                                            disabled={ocupado}
                                            title={ocupado ? "Horário já agendado" : "Disponível"}
                                        >
                                            {horario}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="booking-section full-width">
                            <h2 className="section-title">Observações (Opcional)</h2>
                            <textarea
                                className="barber-textarea"
                                placeholder="Alguma preferência ou observação?"
                                value={formData.observacao}
                                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                                rows="4"
                            />
                        </div>

                        <div className="booking-section full-width">
                            <button
                                className="barber-button"
                                onClick={handleSubmit}
                                disabled={!formData.servicoId || !formData.proprietarioId || !selectedTime}
                            >
                                Confirmar Agendamento
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="dashboard-content">
                    <div className="appointments-list">
                        {agendamentos.length === 0 ? (
                            <div className="empty-state"><p>Você ainda não tem agendamentos.</p></div>
                        ) : (
                            agendamentos.map((a) => (
                                <div key={a.id} className="appointment-card">
                                    <div className="appointment-header">
                                        <h3>{a.servico?.nome || "Serviço"}</h3>
                                        <span className={`status-badge ${a.confirmado ? "confirmed" : "pending"}`}>
                                            {a.confirmado ? "Confirmado" : "Pendente"}
                                        </span>
                                    </div>
                                    <div className="appointment-details">
                                        <p><strong>Barbeiro:</strong> {a.proprietario?.nome || "N/A"}</p>
                                        <p><strong>Data/Hora:</strong> {new Date(a.dataHora).toLocaleString("pt-BR")}</p>
                                        <p><strong>Preço:</strong> R$ {(a.precoFinal || 0).toFixed(2)}</p>
                                        {a.observacao && <p><strong>Obs:</strong> {a.observacao}</p>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* O botão "Ver Todos (Admin)" foi movido para o menu hambúrguer para manter o foco na centralização */}


            {toastMessage && <div className="toast">{toastMessage}</div>}
        </div>
    )
}