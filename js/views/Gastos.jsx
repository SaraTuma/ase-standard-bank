function Gastos({ sessao, chamar }) {
  const [contas, setContas] = React.useState([]);
  const [contaSelecionada, setContaSelecionada] = React.useState("");
  const [l, setL] = React.useState(null);
  const [estado, setEstado] = React.useState(null);
  const [ocupado, setOcupado] = React.useState(true);
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
        })).filter(a => a.id); // Garante que só guarda contas válidas

        setContas(listaContas);
        if (listaContas.length > 0) {
          setContaSelecionada(listaContas[0].id);
        }
      }
      setCarregandoContas(false);
    }
    if (sessao?.customerId) obterContas();
  }, [sessao.customerId, chamar]);

  // 2. Carregar insights de gastos quando a conta selecionada mudar
  const carregar = React.useCallback(async () => {
    if (!contaSelecionada) return;
    setOcupado(true);
    setEstado(null);
    
    
    const r = await chamar("viewSpendingInsights", { customerId: contaSelecionada });
    
    if (r.erro) {
      setEstado(r);
      setL([]); // Define como lista vazia em caso de erro para não travar a UI
    } else {
      // Extrai e filtra apenas insights válidos (com categoria ou mensagem)
      const listaInsights = all(r.doc, "insight")
        .map(i => ({
          categoria: text(i, "category"),
          mensagem: text(i, "message"),
          esteMes: text(i, "currentMonth"),
          mesPassado: text(i, "lastMonth"),
          pct: num(i, "changePercentage")
        }))
        .filter(i => i.categoria || i.mensagem); // Garante que ignora nós vazios retornados do XML

      setL(listaInsights);
    }
    setOcupado(false);
  }, [contaSelecionada, chamar]);

  React.useEffect(() => {
    if (contaSelecionada) {
      carregar();
    }
  }, [contaSelecionada, carregar]);

  return (
    <>
      <Cabecalho titulo="Os seus gastos" sub="Comparação com o mês anterior, categoria a categoria">
        <Botao variante="ghost" ocupado={ocupado || carregandoContas} onClick={carregar}>
          Actualizar
        </Botao>
      </Cabecalho>

      {/* Select para escolher a conta */}
      {contas.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>
            Selecione a Conta:
          </label>
          <select
            className="campo"
            value={contaSelecionada}
            onChange={(e) => setContaSelecionada(e.target.value)}
            disabled={ocupado}
            style={{ width: "100%", padding: "10px", borderRadius: "8px" }}
          >
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.tipo}
              </option>
            ))}
          </select>
        </div>
      )}

      <Resultado estado={estado} />
      
      {(ocupado || carregandoContas) && !l && (
        <div className="card"><Esqueleto n={5} /></div>
      )}

      {!ocupado && !carregandoContas && l && (
        <section className="card">
          {l.length === 0 ? (
            <Vazio titulo="Não há gastos registrados nesta conta">
              Não foram encontrados registos ou movimentos de gastos para a conta selecionada.
            </Vazio>
          ) : (
            l.map((i, k) => (
              <div className="insight" key={k}>
                <span className="c">{cat(i.categoria)}</span>         
                <div className="t">
                  <span>{i.mensagem}</span>
                  <div>Mês passado: {i.mesPassado} Kz | Este mês: {i.esteMes} Kz </div>
                </div>
                {i.pct !== null && (
                  <span className={"p " + (i.pct < 0 ? "pos" : i.pct > 0 ? "neg" : "")}>
                    {pctF(i.pct)}
                  </span>
                )}
              </div>
            ))
          )}
        </section>
      )}
    </>
  );
}