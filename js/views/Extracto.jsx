function Extracto({ sessao, chamar }) {
  const [contas, setContas] = React.useState([]);
  const [f, setF] = React.useState({ accountId: "", startDate: maisDias(-90), endDate: hoje() });
  const c = k => v => setF(s => ({ ...s, [k]: v }));
  
  const [d, setD] = React.useState(null);
  const [estado, setEstado] = React.useState(null);
  const [ocupado, setOcupado] = React.useState(false);
  const [carregandoContas, setCarregandoContas] = React.useState(true);

  // Estados para Filtros e Paginação na tabela
  const [busca, setBusca] = React.useState("");
  const [filtroTipo, setFiltroTipo] = React.useState("TODOS");
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
    setPaginaAtual(1); // Reset da página ao consultar
    
    const r = await chamar("viewStatement", f);
    if (r.erro) { 
      setEstado(r); 
      setD(null); 
    } else {
      setD({
        conta: text(r.doc, "destinationAccount"), 
        iban: text(r.doc, "iban"),
        movs: all(r.doc, "transaction").map(t => ({
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

  // 3. Lógica de Filtragem dos Movimentos
  const movsFiltrados = React.useMemo(() => {
    if (!d || !d.movs) return [];
    
    return d.movs.filter(m => {
      // Filtro por tipo
      if (filtroTipo === "CREDITO" && m.tipo !== "CREDITO") return false;
      if (filtroTipo === "DEBITO" && m.tipo !== "DEBITO") return false;

      // Filtro de pesquisa de texto
      if (busca.trim() !== "") {
        const termo = busca.toLowerCase();
        const desc = (m.descricao || "").toLowerCase();
        const ref = (m.id || "").toLowerCase();
        const catNome = (m.categoria || "").toLowerCase();
        const catData = (m.data || "").toLowerCase();

        return desc.includes(termo) || ref.includes(termo) || catNome.includes(termo);
      }

      return true;
    });
  }, [d, busca, filtroTipo]);

  // Reset para a página 1 ao alterar pesquisas/filtros
  React.useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroTipo, itensPorPagina]);

  // 4. Lógica de Paginação
  const totalPaginas = Math.ceil(movsFiltrados.length / itensPorPagina) || 1;
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const movsPaginados = movsFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina);

  // Totais globais
  const entradas = d ? d.movs.filter(m => m.tipo === "CREDITO").reduce((s, m) => s + m.valor, 0) : 0;
  const saidas   = d ? d.movs.filter(m => m.tipo === "DEBITO").reduce((s, m) => s + m.valor, 0) : 0;

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>
              {d.movs.length} {d.movs.length === 1 ? "movimento" : "movimentos"}
              <span className="side mono">{ibanF(d.iban)}</span>
            </h3>

            {/* Barra de Filtros Rápidos */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Pesquisar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="campo"
                style={{ padding: "6px 12px", fontSize: 13, minWidth: 160 }}
              />

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="campo"
                style={{ padding: "6px 12px", fontSize: 13 }}
              >
                <option value="TODOS">Todos os tipos</option>
                <option value="CREDITO">Entradas</option>
                <option value="DEBITO">Saídas</option>
              </select>
            </div>
          </div>

          {d.movs.length === 0 ? (
            <Vazio titulo="Sem movimentos neste período">
              Alargue as datas e consulte de novo.
            </Vazio>
          ) : movsFiltrados.length === 0 ? (
            <Vazio titulo="Nenhum resultado encontrado">
              Nenhum movimento corresponde aos critérios da sua pesquisa.
            </Vazio>
          ) : (
            <>
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
                    {movsPaginados.map((m, i) => (
                      <tr key={m.id || i}>
                        <td className="mono" style={{ fontSize: 13 }}>{dt(m.data)}</td>
                        <td>
                          {m.descricao || "Movimento " + m.id}
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>Ref. {m.id}</div>
                        </td>
                        <td><span className="tag">{cat(m.categoria)}</span></td>
                        <td 
                          style={{ 
                            fontSize: 13, 
                            color: m.tipo === "DEBITO" ? "#e53e3e" : m.tipo === "CREDITO" ? "#38a169" : "var(--ink-3)" 
                          }}
                        >
                          {m.tipo === "DEBITO" ? "Saída" : m.tipo === "CREDITO" ? "Entrada" : m.tipo}
                        </td>
                        <td className={"num mono " + (m.valor < 0 || m.tipo === "DEBITO" ? "neg" : "pos")}>
                          {kz(m.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4">Entradas Total</td>
                      <td className="num mono pos">{kz(entradas)}</td>
                    </tr>
                    <tr>
                      <td colSpan="4" style={{ borderTop: "none", paddingTop: 0 }}>Saídas Total</td>
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

              {/* Controlo de Paginação */}
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
                  A mostrar {indiceInicial + 1}–{Math.min(indiceInicial + itensPorPagina, movsFiltrados.length)} de {movsFiltrados.length}
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