const MENU = [
  { grupo:"A minha conta" },
  { id:"contas",     nome:"Contas",        C:Contas },
  { id:"extracto",   nome:"Extracto",      C:Extracto },
  { id:"gastos",     nome:"Gastos",        C:Gastos },
  { grupo:"Movimentar dinheiro" },
  { id:"transferir", nome:"Transferir",    C:Transferir },
  { id:"agendar",    nome:"Agendar",       C:Agendar },
  { id:"benef",      nome:"Beneficiários", C:Beneficiarios },
  { grupo:"Serviços" },
  { id:"cartao",     nome:"Cartão",        C:Cartao },
  { id:"exportar",   nome:"Exportar",      C:Exportar }
];

function App() {
  const [sessao, setSessao] = React.useState(() => recuperar());
  const [pagina, setPagina] = React.useState("contas");

  const chamar = React.useCallback(async (op, dados) => {
    try { return await soap(op, dados, sessao); }
    catch (erro) {
      if (erro.tipo === "sessao") { sair(); setSessao(null); }
      return { erro };
    }
  }, [sessao]);

  const terminar = React.useCallback(() => { sair(); setSessao(null); setPagina("contas"); }, []);

  React.useEffect(() => {
    if (!sessao || !sessao.expira) return;
    const falta = sessao.expira - Date.now();
    if (falta <= 0) { terminar(); return; }
    const t = setTimeout(terminar, Math.min(falta, 2147483647));
    return () => clearTimeout(t);
  }, [sessao, terminar]);

  if (!sessao) return <Login aoEntrar={setSessao} />;

  const item = MENU.find(i => i.id === pagina) || MENU[1];
  const Vista = item.C;

  return (
    <>
      <header className="topbar">
        <div className="topbar-in">
          <Marca t={28} escuro />
          <div className="who">
            <div style={{ textAlign:"right", minWidth:0 }}>
              <div className="n">{sessao.nome}</div>
              <div className="i">Cliente {sessao.customerId}</div>
            </div>
            <span className="sep" aria-hidden="true" />
            <button className="out" onClick={terminar}>Sair</button>
          </div>
        </div>
      </header>

      <div className="shell">
        <nav className="rail" aria-label="Secções">
          {MENU.map((i,k) => i.grupo
            ? <div className="g" key={"g"+k}>{i.grupo}</div>
            : <button key={i.id} aria-current={pagina === i.id}
                      onClick={() => setPagina(i.id)}>{i.nome}</button>)}
        </nav>
        <main><Vista key={item.id} sessao={sessao} chamar={chamar} /></main>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);