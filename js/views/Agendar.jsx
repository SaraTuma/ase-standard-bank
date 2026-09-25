function Agendar({ sessao, chamar }) {
  const [f, setF] = React.useState({
    sourceAccountId:"1", destinationAccountId:"2", amount:"25000", description:"",
    scheduledDate:maisDias(7), recurrence:"MENSAL", endDate:maisDias(180)
  });
  const c = k => v => setF(s => ({ ...s, [k]:v }));
  const [res, setRes] = React.useState(null);
  const [estado, setEstado] = React.useState(null);
  const [ocupado, setOcupado] = React.useState(false);

  const unica = f.recurrence === "UNICA";
  const valor = Number(f.amount);

  const problema =
    !f.scheduledDate ? "Indique a data da transferência."
    : f.scheduledDate < hoje() ? "A data não pode ser anterior a hoje."
    : !(valor > 0) ? "O valor tem de ser maior do que zero."
    : f.sourceAccountId === f.destinationAccountId ? "As contas têm de ser diferentes."
    : (!unica && !f.endDate) ? "Indique quando o agendamento termina."
    : (!unica && f.endDate <= f.scheduledDate) ? "A data de fim tem de ser posterior à primeira execução."
    : null;

  async function enviar() {
    setOcupado(true); setEstado(null); setRes(null);
    const corpo = { customerId: sessao.customerId, ...f };
    if (unica) corpo.endDate = "";
    const r = await chamar("scheduleTransfer", corpo);
    if (r.erro) setEstado(r);
    else setRes({
      id:text(r.doc,"scheduleId"), status:text(r.doc,"status"),
      proxima:text(r.doc,"nextExecutionDate"), mensagem:text(r.doc,"message")
    });
    setOcupado(false);
  }

  return (
    <>
      <Cabecalho titulo="Agendar transferência" sub="Programe agora, o banco executa na data certa" />
      <Resultado estado={estado} />

      {res && (
        <div className="msg ok" role="status">
          <h4><Estado valor={res.status} />Agendamento criado</h4>
          <p>{res.mensagem}</p>
          <div className="grid">
            <div><span className="l">Referência</span><span className="v">{res.id}</span></div>
            <div><span className="l">Primeira execução</span><span className="v">{dia(res.proxima)}</span></div>
            <div><span className="l">Valor</span><span className="v">{kz(valor)}</span></div>
          </div>
        </div>)}

      <section className="card">
        <div className="form">
          <Campo etiqueta="Conta de origem" valor={f.sourceAccountId} aoMudar={c("sourceAccountId")} />
          <Campo etiqueta="Conta de destino" valor={f.destinationAccountId} aoMudar={c("destinationAccountId")} />
          <Campo etiqueta="Valor" tipo="number" step="0.01" min="0" mono valor={f.amount}
                 aoMudar={c("amount")} dica={valor > 0 ? kz(valor) : "Em Kwanzas"} />
          <Campo etiqueta="Primeira execução" tipo="date" min={hoje()}
                 valor={f.scheduledDate} aoMudar={c("scheduledDate")} />
          <Campo etiqueta="Repetição" valor={f.recurrence} aoMudar={c("recurrence")}
                 opcoes={[{v:"UNICA",t:"Uma única vez"},{v:"SEMANAL",t:"Todas as semanas"},{v:"MENSAL",t:"Todos os meses"}]} />
          <Campo etiqueta="Termina a" tipo="date" disabled={unica} min={f.scheduledDate}
                 valor={unica ? "" : f.endDate} aoMudar={c("endDate")}
                 dica={unica ? "Não se aplica a uma transferência única." : "Obrigatória quando há repetição."} />
          <Campo etiqueta="Descrição" valor={f.description} aoMudar={c("description")}
                 placeholder="Opcional" maxLength="80" />
        </div>
        <div className="actions">
          <Botao variante="gold" ocupado={ocupado} disabled={!!problema} onClick={enviar}>
            {ocupado ? "A agendar" : "Agendar"}</Botao>
          {problema && <span className="hint" style={{color:"var(--bad)"}}>{problema}</span>}
        </div>
      </section>
    </>
  );
}