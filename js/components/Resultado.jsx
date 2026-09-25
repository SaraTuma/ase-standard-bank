function Resultado({ estado }) {
  if (!estado) return null;
  if (estado.erro) {
    const e = estado.erro;
    return (
      <div className="msg err" role="alert">
        <h4>{e.errorCode}</h4>
        <p>{e.errorMessage}</p>
        {e.detalhe && <div className="ref">{e.detalhe}</div>}
        {e.correlationId && <div className="ref">Referência: {e.correlationId}</div>}
        {(e.request || e.response) && (
          <details className="raw"><summary>Ver XML trocado com o servidor</summary>
            <pre>{"— PEDIDO —\n" + (e.request||"") + "\n\n— RESPOSTA —\n" + (e.response||"(nenhuma)")}</pre>
          </details>)}
      </div>
    );
  }
  return (
    <div className={"msg " + (estado.nivel || "ok")} role="status">
      <h4>{estado.etiqueta}{estado.titulo}</h4>
      {estado.texto && <p>{estado.texto}</p>}
      {estado.dados && (
        <div className="grid">
          {estado.dados.filter(Boolean).map((d,i) =>
            <div key={i}><span className="l">{d.l}</span><span className="v">{d.v}</span></div>)}
        </div>)}
      {estado.ref && <div className="ref">{estado.ref}</div>}
    </div>
  );
}