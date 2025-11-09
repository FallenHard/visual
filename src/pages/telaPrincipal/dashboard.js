"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";
import "../../barber.css"
import "../../dashboard.css"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("novo")
  const [servicos, setServicos] = useState([])
  const [barbeiros, setBarbeiros] = useState([])
  const [agendamentos, setAgendamentos] = useState([])
  const [userRole, setUserRole] = useState("")
  const router = useRouter();

  const [formData, setFormData] = useState({
    servicoId: "",
    proprietarioId: "",
    dataHora: "",
    observacao: "",
  })

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState("")

  const horariosDisponiveis = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
  ]

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    console.log("[v0] Iniciando carregamento de dados...")

    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]))
        const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || ""
        setUserRole(role)
        console.log("[v0] User role:", role)
      } catch (error) {
        console.log("[v0] Erro ao decodificar token:", error)
      }
    }

    try {
      // Buscar serviços
      console.log("[v0] Buscando serviços em: http://localhost:5069/api/Servicos/todos")
      const servicosResponse = await fetch("http://localhost:5069/api/Servicos/todos")
      console.log("[v0] Status da resposta de serviços:", servicosResponse.status)

      if (servicosResponse.ok) {
        const servicosData = await servicosResponse.json()
        console.log("[v0] Serviços recebidos da API:", servicosData)
        setServicos(servicosData)
      } else {
        console.log("[v0] Resposta não OK para serviços")
        setServicos([])
      }
    } catch (error) {
      console.log("[v0] Erro ao carregar serviços:", error.message)
      setServicos([])
    }

    try {
      // Buscar proprietários (barbeiros)
      console.log("[v0] Buscando proprietários em: http://localhost:5069/api/Proprietarios/todos")
      const proprietariosResponse = await fetch("http://localhost:5069/api/Proprietarios/todos")
      console.log("[v0] Status da resposta de proprietários:", proprietariosResponse.status)

      if (proprietariosResponse.ok) {
        const proprietariosData = await proprietariosResponse.json()
        console.log("[v0] Proprietários recebidos da API:", proprietariosData)
        setBarbeiros(proprietariosData)
      } else {
        console.log("[v0] Resposta não OK para proprietários")
        setBarbeiros([])
      }
    } catch (error) {
      console.log("[v0] Erro ao carregar barbeiros:", error.message)
      setBarbeiros([])
    }

    try {
      // Buscar agendamentos
      console.log("[v0] Buscando agendamentos em: http://localhost:5069/api/Agendamento/todos")
      const agendamentosResponse = await fetch("http://localhost:5069/api/Agendamento/todos")
      console.log("[v0] Status da resposta de agendamentos:", agendamentosResponse.status)

      if (agendamentosResponse.ok) {
        const agendamentosData = await agendamentosResponse.json()
        console.log("[v0] Agendamentos recebidos da API:", agendamentosData)
        setAgendamentos(agendamentosData)
      }
    } catch (error) {
      console.log("[v0] Erro ao carregar agendamentos:", error.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const servicoSelecionado = servicos.find((s) => s.id === formData.servicoId)
    if (!servicoSelecionado) {
      alert("Por favor, selecione um serviço.")
      return
    }

    const dataHoraCompleta = `${selectedDate.toISOString().split("T")[0]}T${selectedTime}:00`

    const agendamentoDto = {
      clienteId: 1, // TODO: Replace with actual logged-in client ID
      proprietarioId: formData.proprietarioId,
      servicoId: formData.servicoId,
      dataHora: dataHoraCompleta,
      observacao: formData.observacao || "",
      precoFinal: servicoSelecionado.preco,
      confirmado: false,
    }

    try {
      const response = await fetch("http://localhost:5069/api/Agendamento/criar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agendamentoDto),
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message || "Agendamento realizado com sucesso!")
        setFormData({ servicoId: "", proprietarioId: "", dataHora: "", observacao: "" })
        setSelectedTime("")
        carregarDados()
        setActiveTab("meus")
      } else {
        const error = await response.text()
        alert(`Erro ao realizar agendamento: ${error}`)
      }
    } catch (error) {
      console.error("Erro ao criar agendamento:", error)
      alert("Erro ao realizar agendamento. Verifique se a API está rodando.")
    }
  }

  const formatarData = (dataString) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderCalendario = () => {
    const hoje = new Date()
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    const primeiroDia = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const ultimoDia = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)

    const dias = []
    const diaInicial = primeiroDia.getDay()

    for (let i = 0; i < diaInicial; i++) {
      dias.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

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
        </div>,
      )
    }

    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <button
            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
            className="calendar-nav"
          >
            ←
          </button>
          <h3>{selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h3>
          <button
            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
            className="calendar-nav"
          >
            →
          </button>
        </div>
        <div className="calendar-weekdays">
          {diasSemana.map((dia) => (
            <div key={dia} className="weekday">
              {dia}
            </div>
          ))}
        </div>
        <div className="calendar-grid">{dias}</div>
      </div>
    )
  }

  const handleAdminClick = () => {
    console.log("[v0] Admin button clicked, navigating to /admin/agendamentos")
    navigate("/admin/agendamentos")
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Agendamentos</h1>
        <p className="dashboard-subtitle">Agende seu horário com os melhores profissionais</p>
      </div>

      <div className="dashboard-tabs">
        <button className={`tab-button ${activeTab === "novo" ? "active" : ""}`} onClick={() => setActiveTab("novo")}>
          Novo Agendamento
        </button>
        <button className={`tab-button ${activeTab === "meus" ? "active" : ""}`} onClick={() => setActiveTab("meus")}>
          Meus Agendamentos
        </button>
      </div>

      {activeTab === "novo" ? (
        <div className="dashboard-content">
          <div className="booking-grid">
            <div className="booking-section">
              <h2 className="section-title">Escolha o Serviço</h2>
              {servicos.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhum serviço cadastrado. Verifique se a API está rodando e se há serviços no banco de dados.</p>
                </div>
              ) : (
                <div className="services-grid">
                  {servicos.map((servico) => (
                    <div
                      key={servico.id}
                      className={`service-card ${formData.servicoId === servico.id ? "selected" : ""}`}
                      onClick={() => setFormData({ ...formData, servicoId: servico.id })}
                    >
                      <h3>{servico.nome}</h3>
                      <p className="service-price">R$ {servico.preco.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="booking-section">
              <h2 className="section-title">Escolha o Barbeiro</h2>
              {barbeiros.length === 0 ? (
                <div className="empty-state">
                  <p>
                    Nenhum barbeiro cadastrado. Verifique se a API está rodando e se há proprietários no banco de dados.
                  </p>
                </div>
              ) : (
                <div className="barbers-grid">
                  {barbeiros.map((barbeiro) => (
                    <div
                      key={barbeiro.id}
                      className={`barber-card ${formData.proprietarioId === barbeiro.id ? "selected" : ""}`}
                      onClick={() => setFormData({ ...formData, proprietarioId: barbeiro.id })}
                    >
                      <div className="barber-avatar">{barbeiro.nome.charAt(0)}</div>
                      <h3>{barbeiro.nome}</h3>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="booking-section">
              <h2 className="section-title">Escolha a Data</h2>
              {renderCalendario()}
            </div>

            <div className="booking-section">
              <h2 className="section-title">Escolha o Horário</h2>
              <div className="time-grid">
                {horariosDisponiveis.map((horario) => (
                  <button
                    key={horario}
                    className={`time-slot ${selectedTime === horario ? "selected" : ""}`}
                    onClick={() => setSelectedTime(horario)}
                  >
                    {horario}
                  </button>
                ))}
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
              <div className="empty-state">
                <p>Você ainda não tem agendamentos.</p>
              </div>
            ) : (
              agendamentos.map((agendamento) => (
                <div key={agendamento.id} className="appointment-card">
                  <div className="appointment-header">
                    <h3>{agendamento.servico?.nome || "Serviço"}</h3>
                    <span className={`status-badge ${agendamento.confirmado ? "confirmed" : "pending"}`}>
                      {agendamento.confirmado ? "Confirmado" : "Pendente"}
                    </span>
                  </div>
                  <div className="appointment-details">
                    <p>
                      <strong>Barbeiro:</strong> {agendamento.proprietario?.nome || "N/A"}
                    </p>
                    <p>
                      <strong>Data/Hora:</strong> {new Date(agendamento.dataHora).toLocaleString("pt-BR")}
                    </p>
                    <p>
                      <strong>Preço:</strong> R$ {agendamento.precoFinal?.toFixed(2) || "0.00"}
                    </p>
                    {agendamento.observacao && (
                      <p>
                        <strong>Observação:</strong> {agendamento.observacao}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {userRole === "Proprietario" && (
        <button className="admin-button" onClick={handleAdminClick}>
          <span>👤</span>
          <span>Painel Admin</span>
        </button>
      )}
    </div>
  )
}
