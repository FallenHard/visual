"use client"
import "../../AdminAgendamento.css"

export default function AdminPage() {
    // ... suas lógicas de agendamentos aqui ...

    return (
        <div className="admin-container">
            {/* Header e Stats aqui... */}

            <div className="admin-appointments">
                {agendamentos.map((ag) => (
                    <div key={ag.id} className="appointment-card">
                        <div className="card-content">
                            <div className="appointment-header">
                                <h3 className="appointment-service">{ag.servicoNome}</h3>
                                <span className={`appointment-status status-${ag.status.toLowerCase()}`}>
                                    {ag.status}
                                </span>
                            </div>

                            <div className="appointment-details">
                                <div className="detail-row">
                                    <span className="detail-label">Cliente:</span>
                                    <span className="detail-value">{ag.clienteNome}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Data:</span>
                                    <span className="detail-value">{new Date(ag.dataHora).toLocaleDateString("pt-BR")}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Preço:</span>
                                    <span className="detail-value price">R$ {ag.precoFinal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* BOTÕES NA BASE - CORRIGIDO */}
                        <div className="button-group">
                            <button className="concluir-btn">Concluir</button>
                            <button className="excluir-btn" onClick={() => handleDelete(ag.id)}>
                                Excluir
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}