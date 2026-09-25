function Transferir({ sessao, chamar }) {
  const [contas, setContas] = React.useState([]);
  const [f, setF] = React.useState({ sourceAccountId: "", destinationAccountId: "", amount: "5000", description: "" });
  const c = k => v => setF(s => ({ ...s, [k]: v }));
  
  const [res, setRes] = React.useState(null);
  const [estado, setEstado] = React.useState(null);
  const [ocupado, setOcupado] = React.useState(false);
  const [carregandoContas, setCarregandoContas] = React.useState(true);

  // 1. Carregar as contas do cliente via viewDashboard
  React.useEffect(() => {
    async function obterContas() {
      setCarregandoContas(true);
      const r = await chamar("viewDashboard", { customerId: sessao.customerId });
      if (r.erro) {
        setEstado(r);
      } else {
        const listaContas = all(r.doc, "account").map(a => ({
          id: text(a, "accountId"),
          iban: text(a, "iban") || text(a, "accountId"),
          tipo: text(a, "accountType"),
          saldo: num(a, "balance")
        })).filter(a => a.id);

        setContas(listaContas);
        if (listaContas.length > 0) {
          setF(s => ({ ...s, sourceAccountId: listaContas[0].id }));
        }
      }
      setCarregandoContas(false);
    }
    obterContas();
  }, [sessao.customerId, chamar]);

  const valor = Number(f.amount);
  const igual = f.sourceAccountId.trim() !== "" && f.sourceAccountId === f.destinationAccountId.trim();
  const valido = f.sourceAccountId.trim() && f.destinationAccountId.trim() && valor > 0 && !igual;

  async function enviar() {
    setOcupado(true);
    setEstado(null);
    setRes(null);

    const r = await chamar("makeTransfer", { customerId: sessao.customerId, ...f });
    if (r.erro) {
      setEstado(r);
    } else {
      setRes({
        status: text(r.doc, "status"),
        message: text(r.doc, "message"),
        saldo: num(r.doc, "newBalance"),
        risco: text(r.doc, "riskFlag"),
        alerta: text(r.doc, "alertMessage"),
        valor
      });
    }
    setOcupado(false);
  }

  return (
    <>
      <Cabecalho titulo="Transferir" sub="Transferência imediata entre contas" />
      <Resultado estado={estado} />

      {res && (
        <div className={"msg " + (res.status === "EXECUTADA" ? "ok" : res.status === "RECUSADA" ? "err" : "warn")}
             role="status">
          <h4><Estado valor={res.status} />{kz(res.valor)}</h4>
          <p>{res.message}</p>
          <div className="grid">
            <div><span className="l">Saldo após a operação</span><span className="v">{kz(res.saldo)}</span></div>
            <div><span className="l">Verificação de segurança</span>
              <span className="v" style={{ fontFamily: "var(--sans)", fontSize: 14 }}><Risco valor={res.risco} /></span>
            </div>
          </div>
          {res.alerta && <div className="ref" style={{ fontFamily: "var(--sans)", fontSize: 13 }}>{res.alerta}</div>}
        </div>
      )}

      <section className="card">
        {carregandoContas ? (
          <Esqueleto n={3} />
        ) : (
          <div className="form">
            {/* Conta de Origem (Select com as contas do cliente) */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
                Conta de origem
              </label>
              <select
                className="campo"
                value={f.sourceAccountId}
                onChange={(e) => c("sourceAccountId")(e.target.value)}
                disabled={ocupado}
                style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
              >
                {contas.length === 0 && <option value="">Sem contas disponíveis</option>}
                {contas.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.id} - ({kz(acc.saldo)})
                  </option>
                ))}
              </select>
            </div>

            {/* Conta de Destino (Campo de texto digitado livremente) */}
            <Campo
              etiqueta="Conta de destino"
              valor={f.destinationAccountId}
              aoMudar={c("destinationAccountId")}
              placeholder="Digite o ID da conta ou IBAN de destino"
            />

            <Campo
              etiqueta="Valor"
              tipo="number"
              step="0.01"
              min="0"
              mono
              valor={f.amount}
              aoMudar={c("amount")}
              dica={valor > 0 ? kz(valor) : "Em Kwanzas"}
            />

            <Campo
              etiqueta="Descrição"
              valor={f.description}
              aoMudar={c("description")}
              placeholder="Opcional"
              maxLength="80"
              dica="Aparece no extracto de ambas as contas."
            />
          </div>
        )}

        <div className="actions">
          <Botao variante="gold" ocupado={ocupado} disabled={!valido || carregandoContas} onClick={enviar}>
            {ocupado ? "A processar" : "Transferir"}
          </Botao>
          {igual && (
            <span className="hint" style={{ color: "var(--bad)" }}>
              A conta de destino tem de ser diferente da de origem.
            </span>
          )}
        </div>
      </section>
    </>
  );
}