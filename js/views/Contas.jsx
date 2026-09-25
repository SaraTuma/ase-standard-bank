function Contas({ sessao, chamar }) {
  const [d, setD] = React.useState(null);
  const [estado, setEstado] = React.useState(null);
  const [ocupado, setOcupado] = React.useState(true);

  const carregar = React.useCallback(async () => {
    setOcupado(true); 
    setEstado(null);
    
    const r = await chamar("viewDashboard", { customerId: sessao.customerId });
    
    if (r.erro) {
      setEstado(r);
    } else {
      setD({
        // Tenta pegar o nome se existir, senão usa o que estiver na sessão
        nome: text(r.doc, "customerName") || sessao.nome,
        
        // CORRIGIDO: usa "account" (no singular) conforme retornado no SOAP
        contas: all(r.doc, "account").map(a => ({
          id: text(a, "accountId"),
          iban: text(a, "iban"),
          tipo: text(a, "accountType"),
          moeda: text(a, "currency"),
          saldo: num(a, "balance"),
          estado: text(a, "status") || "ACTIVA" // Valor por omissão caso não venha no XML
        })),
        
        // CORRIGIDO: mapeia <aggregateBalance> do XML
        agregado: num(r.doc, "aggregateBalance"),
        
        // Processa as transações apenas se existirem no XML
        recentes: all(r.doc, "recentTransactions").map(t => ({
          id: text(t, "transactionId"),
          descricao: text(t, "description"),
          categoria: text(t, "category"),
          valor: num(t, "amount"),
          data: text(t, "transactionDate")
        }))
      });
    }
    setOcupado(false);
  }, [sessao.customerId, sessao.nome, chamar]);

  React.useEffect(() => { carregar(); }, [carregar]);

  const total = d ? (d.agregado ?? d.contas.reduce((s, c) => s + (c.saldo || 0), 0)) : 0;
  const moeda = d?.contas[0]?.moeda || "AOA";

  return (
    <>
      <Cabecalho 
        titulo={d?.nome ? "Olá, " + d.nome.split(" ")[0] : "As suas contas"}
        sub={diaLongo(new Date().toISOString())}
      >
        <Botao variante="ghost" ocupado={ocupado} onClick={carregar}>Actualizar</Botao>
      </Cabecalho>

      <Resultado estado={estado} />
      
      {ocupado && !d && <div className="card"><Esqueleto n={4} /></div>}

      {d && (
        <>
          <div className="total">
            <div>
              <span className="l">Saldo disponível em todas as contas</span>
              <span className="v">{kz(total, true)} <span style={{ fontSize: 20, opacity: .6 }}>{moeda}</span></span>
            </div>
            <div className="a">
              <b>{d.contas.length}</b> {d.contas.length === 1 ? "conta activa" : "contas activas"}
            </div>
          </div>

          {d.contas.length === 0 ? (
            <div className="card">
              <Vazio titulo="Ainda não há contas associadas">
                Fale com o seu gestor de conta.
              </Vazio>
            </div>
          ) : (
            <div className="accounts">
              {d.contas.map((c, i) => (
                <article className="acct" key={c.id || i}>
                  <div className="r1">
                    <span className="k">{cat(c.tipo)}</span>
                    <Estado valor={c.estado} />
                  </div>
                  <div className="b">{kz(c.saldo, true)} <span className="c">{c.moeda}</span></div>
                  <div className="ib">{ibanF(c.iban)}</div>
                  <div className="rf">Conta n.º {c.id}</div>
                </article>
              ))}
            </div>
          )}

          {/* Opcional: Só renderiza o bloco de movimentos recentes se existirem transações no XML */}
          {d.recentes.length > 0 && (
            <section className="card">
              <h3>
                Movimentos recentes
                <span className="side">{d.recentes.length} últimos</span>
              </h3>
              <div className="scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th>Categoria</th>
                      <th className="num">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.recentes.map((t, i) => (
                      <tr key={t.id || i}>
                        <td className="mono" style={{ fontSize: 13 }}>{dt(t.data)}</td>
                        <td>
                          {t.descricao || "Movimento " + t.id}
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>Ref. {t.id}</div>
                        </td>
                        <td><span className="tag">{cat(t.categoria)}</span></td>
                        <td className={"num mono " + (t.valor < 0 ? "neg" : "pos")}>{kz(t.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}