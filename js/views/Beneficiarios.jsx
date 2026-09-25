function Beneficiarios({ sessao, chamar }) {
  const [l, setL] = React.useState(null);
  const [f, setF] = React.useState({ beneficiaryName:"", beneficiaryIban:"", alias:"" });
  const c = k => v => setF(s => ({ ...s, [k]:v }));
  const [estado, setEstado] = React.useState(null);
  const [aGuardar, setAGuardar] = React.useState(false);
  const [aRemover, setARemover] = React.useState(null);
  const [aCarregar, setACarregar] = React.useState(true);

  const ibanLimpo = f.beneficiaryIban.replace(/\s/g,"").toUpperCase();
  const ibanOk = /^AO06\d{21}$/.test(ibanLimpo);
  const pode = f.beneficiaryName.trim().length >= 3 && ibanOk && !aGuardar;

  const listar = React.useCallback(async () => {
    const r = await chamar("listBeneficiaries", { customerId: sessao.customerId });
    if (r.erro) setEstado(r);
    else setL(all(r.doc,"beneficiaries").map(b => ({
      id:text(b,"beneficiaryId"), nome:text(b,"beneficiaryName"),
      iban:text(b,"beneficiaryIban"), alias:text(b,"alias")
    })));
    setACarregar(false);
  }, [sessao.customerId, chamar]);

  React.useEffect(() => { listar(); }, [listar]);

  async function adicionar() {
    setAGuardar(true); setEstado(null);
    const r = await chamar("addBeneficiary", {
      customerId: sessao.customerId,
      beneficiaryName: f.beneficiaryName.trim(),
      beneficiaryIban: ibanLimpo,
      alias: f.alias.trim()
    });
    if (r.erro) setEstado(r);
    else {
      setEstado({ nivel:"ok", titulo:"Beneficiário guardado", texto:text(r.doc,"message"),
                  ref:"Referência " + text(r.doc,"beneficiaryId") });
      setF({ beneficiaryName:"", beneficiaryIban:"", alias:"" });
      await listar();
    }
    setAGuardar(false);
  }

  async function remover(b) {
    setARemover(b.id); setEstado(null);
    const r = await chamar("removeBeneficiary", { beneficiaryId: b.id });
    if (r.erro) setEstado(r);
    else {
      setEstado({ nivel:"ok", titulo:"Beneficiário removido",
                  texto: text(r.doc,"message") || b.nome + " já não está na sua lista." });
      await listar();
    }
    setARemover(null);
  }

  return (
    <>
      <Cabecalho titulo="Beneficiários" sub="Guarde as contas que usa com frequência" />
      <Resultado estado={estado} />

      <section className="card">
        <h3>Adicionar beneficiário</h3>
        <div className="form">
          <Campo etiqueta="Nome completo" valor={f.beneficiaryName} aoMudar={c("beneficiaryName")}
                 placeholder="Maria da Costa" maxLength="60" />
          <Campo etiqueta="IBAN" mono valor={f.beneficiaryIban} maxLength="25"
                 aoMudar={v => c("beneficiaryIban")(v.replace(/\s/g,"").toUpperCase())}
                 placeholder="AO06000600000100037131174"
                 dica={f.beneficiaryIban === "" ? "AO06 seguido de 21 dígitos."
                       : ibanOk ? ibanF(ibanLimpo)
                       : "Faltam " + Math.max(0, 25 - ibanLimpo.length) + " caracteres."} />
          <Campo etiqueta="Nome curto" valor={f.alias} aoMudar={c("alias")}
                 placeholder="Opcional" maxLength="20" dica="Como quer ver esta conta na lista." />
        </div>
        <div className="actions">
          <Botao ocupado={aGuardar} disabled={!pode} onClick={adicionar}>
            {aGuardar ? "A guardar" : "Guardar beneficiário"}</Botao>
        </div>
      </section>

      <section className="card">
        <h3>Guardados{l && l.length > 0 && <span className="side">{l.length}</span>}</h3>
        {aCarregar && <Esqueleto n={3} />}
        {!aCarregar && (!l || l.length === 0) &&
          <Vazio titulo="Ainda não guardou nenhuma conta">
            Use o formulário acima para adicionar a primeira.</Vazio>}
        {!aCarregar && l && l.length > 0 && (
          <div className="scroll"><table>
            <thead><tr><th>Nome</th><th>IBAN</th><th>Referência</th><th></th></tr></thead>
            <tbody>{l.map(b => (
              <tr key={b.id}>
                <td><strong style={{fontWeight:600}}>{b.nome}</strong>
                  {b.alias && <span className="tag" style={{marginLeft:8}}>{b.alias}</span>}</td>
                <td className="mono" style={{fontSize:12.5}}>{ibanF(b.iban)}</td>
                <td className="mono" style={{fontSize:12.5,color:"var(--muted)"}}>{b.id}</td>
                <td className="num">
                  <Botao variante="danger" className="sm" ocupado={aRemover === b.id}
                         onClick={() => remover(b)}>Remover</Botao></td>
              </tr>))}</tbody>
          </table></div>)}
      </section>
    </>
  );
}