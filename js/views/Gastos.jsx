function Gastos({ sessao, chamar }) {
  const [contas, setContas] = React.useState([]);
  const [contaSelecionada, setContaSelecionada] = React.useState("");
  const [l, setL] = React.useState(null);
  const [estado, setEstado] = React.useState(null);
  const [ocupado, setOcupado] = React.useState(true);
  const [carregandoContas, setCarregandoContas] = React.useState(true);

  // Estados para Filtros e Paginação
  const [busca, setBusca] = React.useState("");
  const [filtroTendencia, setFiltroTendencia] = React.useState("TODOS");
  const [paginaAtual, setPaginaAtual] = React.useState(1);
  const [itensPorPagina, setItensPorPagina] = React.useState(5);

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
          setContaSelecionada(listaContas[0].id);
        }
      }
      setCarregandoContas(false);
    }
    if (sessao?.customerId) obterContas();
  }, [sessao?.customerId, chamar]);

  // 2. Carregar insights de gastos quando a conta selecionada mudar
  const carregar = React.useCallback(async (idConta) => {
    const targetAccountId = idConta || contaSelecionada;
    if (!targetAccountId) return;
    
    setOcupado(true);
    setEstado(null);
    setPaginaAtual(1); // Reset da página ao recarregar
    
    // Parâmetro corrigido para accountId
    const r = await chamar("viewSpendingInsights", { customerId: targetAccountId });
    
    if (r.erro) {
      setEstado(r);
      setL([]);
    } else {
      const listaInsights = all(r.doc, "insight")
        .map(i => ({
          categoria: text(i, "category"),
          mensagem: text(i, "message"),
          esteMes: text(i, "currentMonth"),
          mesPassado: text(i, "lastMonth"),
          pct: num(i, "changePercentage")
        }))
        .filter(i => i.categoria || i.mensagem);

      setL(listaInsights);
    }
    setOcupado(false);
  }, [contaSelecionada, chamar]);

  React.useEffect(() => {
    if (contaSelecionada) {
      carregar(contaSelecionada);
    }
  }, [contaSelecionada, carregar]);

  // 3. Filtragem dos insights no lado do cliente
  const insightsFiltrados = React.useMemo(() => {
    if (!l) return [];

    return l.filter(i => {
      // Filtro por tendência de gasto (Aumento / Redução)
      if (filtroTendencia === "AUMENTO" && (i.pct === null || i.pct <= 0)) return false;
      if (filtroTendencia === "REDUCAO" && (i.pct === null || i.pct >= 0)) return false;

      // Filtro de pesquisa por texto (Categoria ou Mensagem)
      if (busca.trim() !== "") {
        const termo = busca.toLowerCase();
        const catNome = (i.categoria || "").toLowerCase();
        const msg = (i.mensagem || "").toLowerCase();

        return catNome.includes(termo) || msg.includes(termo);
      }

      return true;
    });
  }, [l, busca, filtroTendencia]);

  // Reset para a página 1 ao alterar filtros
  React.useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroTendencia, itensPorPagina]);

  // 4. Lógica de Paginação
  const totalPaginas = Math.ceil(insightsFiltrados.length / itensPorPagina) || 1;
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const insightsPaginados = insightsFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  return (
    <>
      <Cabecalho titulo="Os seus gastos" sub="Comparação com o mês anterior, categoria a categoria">
        <Botao 
          variante="ghost" 
          ocupado={ocupado || carregandoContas} 
          onClick={() => carregar(contaSelecionada)}
        >
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
            disabled={ocupado || carregandoContas}
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
          {/* Barra Superior de Filtros */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>
              {l.length} {l.length === 1 ? "registo" : "registos"}
            </h3>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Pesquisar categoria..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="campo"
                style={{ padding: "6px 12px", fontSize: 13, minWidth: 160 }}
              />

              <select
                value={filtroTendencia}
                onChange={(e) => setFiltroTendencia(e.target.value)}
                className="campo"
                style={{ padding: "6px 12px", fontSize: 13 }}
              >
                <option value="TODOS">Todas as tendências</option>
                <option value="AUMENTO">Aumento de gastos</option>
                <option value="REDUCAO">Redução de gastos</option>
              </select>
            </div>
          </div>

          {l.length === 0 ? (
            <Vazio titulo="Não há gastos registrados nesta conta">
              Não foram encontrados registos ou movimentos de gastos para a conta selecionada.
            </Vazio>
          ) : insightsFiltrados.length === 0 ? (
            <Vazio titulo="Nenhum resultado encontrado">
              Nenhum gasto corresponde aos critérios da sua pesquisa.
            </Vazio>
          ) : (
            <>
              {/* Lista Paginada de Insights */}
              {insightsPaginados.map((i, k) => (
                <div className="insight" key={k}>
                  <span className="c">{cat(i.categoria)}</span>        
                  <div className="t">
                    <span>{i.mensagem}</span>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                      Mês passado: {i.mesPassado} Kz | Este mês: {i.esteMes} Kz
                    </div>
                  </div>
                  {i.pct !== null && (
                    <span className={"p " + (i.pct < 0 ? "pos" : i.pct > 0 ? "neg" : "")}>
                      {pctF(i.pct)}
                    </span>
                  )}
                </div>
              ))}

              {/* Controlos de Paginação */}
              <div 
                style={{ 
                  display: "flex", 
                  justify: "space-between", 
                  alignItems: "center", 
                  marginTop: 16, 
                  paddingTop: 12, 
                  borderTop: "1px solid var(--border, #eee)",
                  flexWrap: "wrap",
                  gap: 12
                }}
              >
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  A mostrar {indiceInicial + 1}–{Math.min(indiceInicial + itensPorPagina, insightsFiltrados.length)} de {insightsFiltrados.length}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select
                    value={itensPorPagina}
                    onChange={(e) => setItensPorPagina(Number(e.target.value))}
                    className="campo"
                    style={{ padding: "4px 8px", fontSize: 12 }}
                  >
                    <option value={5}>5 por pág.</option>
                    <option value={10}>10 por pág.</option>
                    <option value={20}>20 por pág.</option>
                  </select>

                  <Botao 
                    variante="ghost" 
                    disabled={paginaAtual === 1} 
                    onClick={() => setPaginaAtual(p => p - 1)}
                  >
                    Anterior
                  </Botao>

                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {paginaAtual} / {totalPaginas}
                  </span>

                  <Botao 
                    variante="ghost" 
                    disabled={paginaAtual >= totalPaginas} 
                    onClick={() => setPaginaAtual(p => p + 1)}
                  >
                    Seguinte
                  </Botao>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}