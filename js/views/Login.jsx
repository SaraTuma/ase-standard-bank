function Login({ aoEntrar }) {
  const m = CONFIG.marca;
  const [u, setU] = React.useState("");
  const [p, setP] = React.useState("");
  const [manual, setManual] = React.useState(false);
  const [tk, setTk] = React.useState("");
  const [cid, setCid] = React.useState("1");
  const [erro, setErro] = React.useState(null);
  const [ocupado, setOcupado] = React.useState(false);

  async function submeter(e) {
    e.preventDefault();
    setOcupado(true); setErro(null);
    try {
      if (manual) aoEntrar(sessaoDoToken(tk.trim(), cid.trim(), null, null));
      else aoEntrar(await entrar(u.trim(), p));
    } catch (ex) {
      setErro({ m: ex.message, d: ex.detalhe }); setP("");
    } finally { setOcupado(false); }
  }

  const pode = manual ? (tk.trim() && cid.trim()) : (u.trim() && p);

  return (
    <div className="login">
      <aside className="login-aside">
        <Marca t={38} escuro />
        <div className="claim">
          <h2>{m.claim}</h2>
          <p>{m.sub}</p>
          <div className="facts">
            <div><span className="n">24/7</span><span className="l">Sempre disponível</span></div>
            <div><span className="n">0 Kz</span><span className="l">Transferências internas</span></div>
            <div><span className="n">AO</span><span className="l">Feito em Angola</span></div>
          </div>
        </div>
        <p style={{ position:"relative", zIndex:1, fontSize:12, color:"#5F7F98", margin:0 }}>
          O banco nunca lhe pede a palavra-passe por telefone ou mensagem.
        </p>
      </aside>

      <main className="login-main">
        <form className="login-form" onSubmit={submeter} noValidate>
          <Marca t={34} texto={false} />
          <h1>{manual ? "Entrar com token" : "Entrar na sua conta"}</h1>
          <p className="lead">
            {manual ? "Cole um token válido e indique o número de cliente."
                    : "Use as credenciais do seu acesso ao banco."}
          </p>

          {erro && (
            <div className="msg err" role="alert">
              <h4>Não foi possível entrar</h4>
              <p>{erro.m}</p>
              {erro.d && <div className="ref">{erro.d}</div>}
            </div>)}

          <div style={{ display:"grid", gap:15 }}>
            {manual ? (
              <>
                <Campo etiqueta="Token JWT" valor={tk} aoMudar={setTk} mono
                       placeholder="eyJhbGciOiJIUzI1NiIs..." autoFocus />
                <Campo etiqueta="Número de cliente" valor={cid} aoMudar={setCid} mono />
              </>
            ) : (
              <>
                <Campo etiqueta="Utilizador" valor={u} aoMudar={setU}
                       autoComplete="username" autoFocus placeholder="o.seu.utilizador" />
                <Campo etiqueta="Palavra-passe" tipo="password" valor={p} aoMudar={setP}
                       autoComplete="current-password" placeholder="••••••••" />
              </>)}
          </div>

          <div className="actions">
            <Botao type="submit" variante="gold" ocupado={ocupado} disabled={!pode}>
              {ocupado ? "A verificar" : "Entrar"}
            </Botao>
          </div>

          {CONFIG.permitirAcessoManual && (
            <div className="alt">
              <button type="button" onClick={() => { setManual(!manual); setErro(null); }}>
                {manual ? "Voltar ao login normal" : "Já tenho um token de acesso"}
              </button>
              <p className="note">
                O acesso por token serve para testar enquanto a API de autenticação
                não está disponível.
              </p>
            </div>)}
        </form>
      </main>
    </div>
  );
}