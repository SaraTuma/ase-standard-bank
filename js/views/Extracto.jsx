function Extracto({ sessao, chamar }) {
  const [contas, setContas] = React.useState([]);
  const [f, setF] = React.useState({ accountId: "", startDate: maisDias(-90), endDate: hoje() });
  const c = k => v => setF(s => ({ ...s, [k]: v }));
  
  const [d, setD] = React.useState(null);
  const [estado, setEstado] = React.useState(null);
  const [ocupado, setOcupado] = React.useState(false);
  const [carregandoContas, setCarregandoContas] = React.useState(true);

  // 1. Carregar as contas do cliente através do viewDashboard
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
          tipo: text(a, "accountType")
        })).filter(a => a.id);

        setContas(listaContas);
        if (listaContas.length > 0) {
          setF(s => ({ ...s, accountId: listaContas[0].id }));
        }
      }
      setCarregandoContas(false);
    }
    obterContas();
  }, [sessao.customerId, chamar]);

  // 2. Consultar o extracto da conta selecionada
  async function consultar() {
    if (!f.accountId) return;
    setOcupado(true); 
    setEstado(null);
    
    const r = await chamar("viewStatement", f);
    if (r.erro) { 
      setEstado(r); 
      setD(null); 
    } else {
      setD({
        conta: text(r.doc, "accountId"), 
        iban: text(r.doc, "iban"),
        movs: all(r.doc, "transactions").map(t => ({
          id: text(t, "transactionId"), 
          data: text(t, "transactionDate"),
          descricao: text(t, "description"), 
          categoria: text(t, "category"),
          valor: num(t, "amount"), 
          tipo: text(t, "type")
        }))
      });
    }
    setOcupado(false);
  }

  const entradas = d ? d.movs.filter(m => m.valor > 0).reduce((s, m) => s + m.valor, 0) : 0;
  const saidas   = d ? d.movs.filter(m => m.valor < 0).reduce((s, m) => s + m.valor, 0) : 0;

  return (
    <>
      <Cabecalho titulo="Extracto" sub="Movimentos de uma conta num período" />
      
      <Resultado estado={estado} />

      <section className="card">
        {carregandoContas ? (
          <Esqueleto n={3} />
        ) : (
          <>
            <div className="form">
              {/* Select para escolha da conta */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
                  Conta
                </label>
                <select
                  className="campo"
                  value={f.accountId}
                  onChange={(e) => c("accountId")(e.target.value)}
                  disabled={ocupado}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
                >
                  {contas.length === 0 && <option value="">Sem contas disponíveis</option>}
                  {contas.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.id} - {acc.tipo}
                    </option>
                  ))}
                </select>
              </div>

              <Campo etiqueta="De" tipo="date" valor={f.startDate} aoMudar={c("startDate")} />
              <Campo etiqueta="Até" tipo="date" valor={f.endDate} aoMudar={c("endDate")} />
            </div>

            <div className="actions">
              <Botao ocupado={ocupado} disabled={!f.accountId || carregandoContas} onClick={consultar}>
                Consultar
              </Botao>
            </div>
          </>
        )}
      </section>

      {d && (
        <section className="card">
          <h3>
            {d.movs.length} {d.movs.length === 1 ? "movimento" : "movimentos"}
            <span className="side mono">{ibanF(d.iban)}</span>
          </h3>
          
          {d.movs.length === 0 ? (
            <Vazio titulo="Sem movimentos neste período">
              Alargue as datas e consulte de novo.
            </Vazio>
          ) : (
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Tipo</th>
                    <th className="num">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {d.movs.map((m, i) => (
                    <tr key={m.id || i}>
                      <td className="mono" style={{ fontSize: 13 }}>{dt(m.data)}</td>
                      <td>
                        {m.descricao || "Movimento " + m.id}
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>Ref. {m.id}</div>
                      </td>
                      <td><span className="tag">{cat(m.categoria)}</span></td>
                      <td style={{ fontSize: 13, color: "var(--ink-3)" }}>
                        {m.tipo === "DEBITO" ? "Saída" : m.tipo === "CREDITO" ? "Entrada" : m.tipo}
                      </td>
                      <td className={"num mono " + (m.valor < 0 ? "neg" : "pos")}>{kz(m.valor)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4">Entradas</td>
                    <td className="num mono pos">{kz(entradas)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" style={{ borderTop: "none", paddingTop: 0 }}>Saídas</td>
                    <td className="num mono neg" style={{ borderTop: "none", paddingTop: 0 }}>{kz(saidas)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" style={{ borderTop: "none", paddingTop: 0 }}>Saldo do período</td>
                    <td 
                      className={"num mono " + (entradas + saidas < 0 ? "neg" : "pos")}
                      style={{ borderTop: "none", paddingTop: 0 }}
                    >
                      {kz(entradas + saidas)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}