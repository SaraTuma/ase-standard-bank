function Exportar({ chamar }) {
  const [f, setF] = React.useState({ accountId:"1", startDate:maisDias(-90), endDate:hoje(), format:"CSV" });
  const c = k => v => setF(s => ({ ...s, [k]:v }));
  const [estado, setEstado] = React.useState(null);
  const [ocupado, setOcupado] = React.useState(false);

  async function exportar() {
    setOcupado(true); setEstado(null);
    const r = await chamar("exportStatement", f);
    if (r.erro) { setEstado(r); setOcupado(false); return; }

    const nome = text(r.doc,"fileName") || "extracto." + f.format.toLowerCase();
    const mime = text(r.doc,"mimeType") || "application/octet-stream";
    const b64  = text(r.doc,"fileContent");

    if (!b64) {
      setEstado({ nivel:"warn", titulo:"Não há nada para exportar",
                  texto:"Não foram encontrados movimentos neste período." });
    } else {
      try {
        const bytes = Uint8Array.from(atob(b64), ch => ch.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type:mime }));
        const a = document.createElement("a");
        a.href = url; a.download = nome;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setEstado({ nivel:"ok", titulo:"Extracto descarregado", texto:nome,
          dados:[{ l:"Formato", v:f.format }, { l:"Tamanho", v:(bytes.length/1024).toFixed(1) + " KB" }] });
      } catch {
        setEstado({ nivel:"warn", titulo:"Ficheiro ilegível",
                    texto:"O conteúdo recebido não está em base64 válido." });
      }
    }
    setOcupado(false);
  }

  return (
    <>
      <Cabecalho titulo="Exportar extracto" sub="Leve os seus movimentos para onde precisar" />
      <Resultado estado={estado} />
      <section className="card">
        <div className="form">
          <Campo etiqueta="Conta" valor={f.accountId} aoMudar={c("accountId")} />
          <Campo etiqueta="De" tipo="date" valor={f.startDate} aoMudar={c("startDate")} />
          <Campo etiqueta="Até" tipo="date" valor={f.endDate} aoMudar={c("endDate")} />
          <Campo etiqueta="Formato" valor={f.format} aoMudar={c("format")}
                 opcoes={[{v:"CSV",t:"CSV — folha de cálculo"},{v:"PDF",t:"PDF — documento"}]}
                 dica={f.format === "CSV" ? "Abre no Excel e no Google Sheets."
                                          : "Pode ainda não estar disponível."} />
        </div>
        <div className="actions">
          <Botao ocupado={ocupado} onClick={exportar}>{ocupado ? "A preparar" : "Descarregar"}</Botao>
        </div>
      </section>
    </>
  );
}