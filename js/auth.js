const CHAVE = "ase.sessao";

const pedirToken = (u,p) => ({
  method:"POST",
  headers:{ "Content-Type":"application/json", "Accept":"application/json" },
  body: JSON.stringify({ username:u, password:p })
});

const lerLogin = d => ({
  token: d.token || d.access_token || d.accessToken || d.jwt || d.id_token ||
         (d.data && (d.data.token || d.data.access_token)),
  customerId: d.customer_id ?? d.customerId ?? d.clientId ?? d.sub ??
              (d.data && (d.data.customer_id ?? d.data.customerId)) ??
              (d.user && (d.user.customer_id ?? d.user.customerId)),
  nome: d.name || d.fullName || d.customerName ||
        (d.user && (d.user.name || d.user.fullName)) || null
});

const claims = t => {
  try {
    const j = atob(t.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"));
    return JSON.parse(decodeURIComponent(escape(j)));
  } catch { return {}; }
};

const guardar = s => { try { sessionStorage.setItem(CHAVE, JSON.stringify(s)); } catch {} };

const recuperar = () => {
  try {
    const s = JSON.parse(sessionStorage.getItem(CHAVE) || "null");
    if (!s || !s.token) return null;
    if (s.expira && Date.now() >= s.expira) { sair(); return null; }
    return s;
  } catch { return null; }
};

const sair = () => { try { sessionStorage.removeItem(CHAVE); } catch {} };

function sessaoDoToken(token, customerId, nome, utilizador) {
  const c = claims(token);
  const s = {
    token,
    customerId: String(customerId ?? c.customer_id ?? c.customerId ?? c.sub ?? ""),
    nome: nome || c.name || c.preferred_username || utilizador || "Cliente",
    expira: c.exp ? c.exp * 1000 : null
  };
  if (!s.customerId) throw new Error("Não foi possível determinar o número de cliente.");
  guardar(s);
  return s;
}

async function entrar(u, p) {
  let res;
  try { res = await fetch(CONFIG.authEndpoint, pedirToken(u, p)); }
  catch (e) { const x = new Error("Não foi possível contactar o serviço de autenticação."); x.detalhe = e.message; throw x; }

  const bruto = await res.text();
  let d = {}; try { d = bruto ? JSON.parse(bruto) : {}; } catch {}

  if (res.status === 401 || res.status === 403)
    throw new Error(d.message || "Utilizador ou palavra-passe incorrectos.");
  if (!res.ok) { const x = new Error(d.message || "O serviço de autenticação devolveu um erro."); x.detalhe = "HTTP " + res.status; throw x; }

  const { token, customerId, nome } = lerLogin(d);
  if (!token) { const x = new Error("A resposta do login não trouxe nenhum token.");
    x.detalhe = "Ajuste lerLogin(). Campos recebidos: " + Object.keys(d).join(", "); throw x; }

  return sessaoDoToken(token, customerId, nome, u);
}