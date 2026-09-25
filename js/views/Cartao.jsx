function Cartao({ chamar }) {
  const [cardId, setCardId] = React.useState("1");
  const [res, setRes] = React.useState(null);
  const [estado, setEstado] = React.useState(null);
  const [ocupado, setOcupado] = React.useState(null);

  async function agir(action) {
    setOcupado(action); setEstado(null); setRes(null);
    const r = await chamar("blockOrUnblockCard", { cardId, action });
    if (r.erro) setEstado(r);
    else setRes({ id:text(r.doc,"cardId") || cardId, status:text(r.doc,"status"),
                  mensagem:text(r.doc,"message") });
    setOcupado(null);
  }

  const bloqueado = res && /BLOQUEAD/i.test(res.status);

  return (
    <>
      <Cabecalho titulo="O seu cartão" sub="Bloqueie de imediato em caso de perda ou roubo" />
      <Resultado estado={estado} />

      {res && (
        <div className={"msg " + (bloqueado ? "warn" : "ok")} role="status">
          <h4><Estado valor={res.status} />Cartão •••• {ult4(res.id)}</h4>
          <p>{res.mensagem}</p>
        </div>)}

      <div className="total" style={{ maxWidth:380 }}>
        <div>
          <span className="l">Cartão de débito</span>
          <span className="v" style={{ fontSize:23, letterSpacing:".06em" }}>
            •••• •••• •••• {ult4(res ? res.id : cardId)}</span>
          <span className="l" style={{ marginTop:10 }}>
            {res ? String(res.status).replace(/_/g," ") : "Estado por confirmar"}</span>
        </div>
      </div>

      <section className="card">
        <div className="form narrow">
          <Campo etiqueta="Número do cartão" valor={cardId} aoMudar={setCardId} mono
                 dica="Identificador do cartão no sistema." />
        </div>
        <div className="actions">
          <Botao ocupado={ocupado === "BLOQUEAR"} disabled={!!ocupado || !cardId.trim()}
                 onClick={() => agir("BLOQUEAR")}>Bloquear cartão</Botao>
          <Botao variante="ghost" ocupado={ocupado === "DESBLOQUEAR"}
                 disabled={!!ocupado || !cardId.trim()}
                 onClick={() => agir("DESBLOQUEAR")}>Desbloquear</Botao>
        </div>
        <p className="hint" style={{ marginTop:14 }}>
          O bloqueio é imediato e pode ser revertido aqui a qualquer momento.
          Se o cartão foi roubado, ligue também para o apoio ao cliente.
        </p>
      </section>
    </>
  );
}