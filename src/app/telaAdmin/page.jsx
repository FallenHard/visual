"use client"
import "../../AdminAgendamento.css"
import { useState, useEffect } from "react"

export default function AdminPage() {
    const [agendamentos, setAgendamentos] = useState([])

    // exemplo de carregamento (pode trocar pela sua API depois)
    useEffect(() => {
        // mock temporário pra não quebrar
        setAgendamentos([])
    }, [])

    const handleDelete = (id) => {
        console.log("Excluir:", id)

        // exemplo simples removendo da lista
        setAgendamentos((prev) => prev.filter((a) => a.id !== id))
    }

    return (
        <div className="admin-container">
            <div className="admin-appointments">
                {agendamentos.length === 0 ? (
                    <p style={{ color: "#999" }}>Nenhum agendamento</p>
                ) : (
                    agendamentos.map((ag) => (
                        <div key={ag.id} className="appointment-card">
                            <div className="card-content">
                                <div className="appointment-header">
                                    <h3 className="appointment-service">
                                        {ag.servicoNome}
                                    </h3>

                                    <span
                                        className={`appointment-status status-${ag.status?.toLowerCase()}`}
                                    >
                                        {ag.status}
                                    </span>
                                </div>

                                <div className="appointment-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Cliente:</span>
                                        <span className="detail-value">
                                            {ag.clienteNome}
                                        </span>
                                    </div>

                                    <div className="detail-row">
                                        <span className="detail-label">Data:</span>
                                        <span className="detail-value">
                                            {ag.dataHora
                                                ? new Date(ag.dataHora).toLocaleDateString("pt-BR")
                                                : "-"}
                                        </span>
                                    </div>

                                    <div className="detail-row">
                                        <span className="detail-label">Preço:</span>
                                        <span className="detail-value price">
                                            R$ {ag.precoFinal?.toFixed(2) || "0.00"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="button-group">
                                <button className="concluir-btn">
                                    Concluir
                                </button>

                                <button
                                    className="excluir-btn"
                                    onClick={() => handleDelete(ag.id)}
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}