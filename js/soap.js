const all  = (r,n) => r ? Array.from(r.getElementsByTagName("*")).filter(e => e.localName === n) : [];
const one  = (r,n) => all(r,n)[0] || null;
const text = (r,n) => { const e = one(r,n); return e ? e.textContent.trim() : ""; };
const num  = (r,n) => { const t = text(r,n); return t === "" ? null : Number(t); };

const esc = v => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;")
                                .replace(/>/g,"&gt;").replace(/"/g,"&quot;");

const corpoXml = o => Object.entries(o)
  .filter(([,v]) => v !== null && v !== undefined && String(v).trim() !== "")
  .map(([k,v]) => `      <web:${k}>${esc(v)}</web:${k}>`).join("\n");

const envelope = (op,o) =>
`<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="${CONFIG.soapNamespace}">
  <soapenv:Header/>
  <soapenv:Body>
    <web:${op}Request>
${corpoXml(o)}
    </web:${op}Request>
  </soapenv:Body>
</soapenv:Envelope>`;

class Falha extends Error {
  constructor(d){
    super(d.errorMessage || "Não foi possível concluir a operação.");
    Object.assign(this, d);
    if (!CONFIG.mostrarXml) { delete this.request; delete this.response; }
  }
}

async function soap(op, dados, sessao) {
  const xml = envelope(op, dados || {});
  const headers = {
    "Content-Type": "text/xml; charset=UTF-8",
    "SOAPAction": `"${CONFIG.soapNamespace}/${op}"`
  };
  if (sessao && sessao.token) headers["Authorization"] = "Bearer " + sessao.token;

  let res;
  try {
    res = await fetch(CONFIG.soapEndpoint, { method:"POST", headers, body: xml });
  } catch (e) {
    throw new Falha({ tipo:"rede", errorCode:"SEM LIGAÇÃO",
      errorMessage:"O serviço não respondeu. Verifique a ligação à rede e tente novamente.",
      detalhe:e.message, request:xml });
  }

  const bruto = await res.text();

  if (res.status === 401 || res.status === 403)
    throw new Falha({ tipo:"sessao", errorCode:"SESSÃO EXPIRADA",
      errorMessage:"A sua sessão terminou. Entre de novo para continuar.", request:xml, response:bruto });

  const doc = new DOMParser().parseFromString(bruto, "text/xml");
  const fault = one(doc, "Fault");
  if (fault) throw new Falha({
    tipo:"negocio",
    errorCode:     text(fault,"errorCode") || text(fault,"faultcode") || "Erro",
    errorMessage:  text(fault,"errorMessage") || text(fault,"faultstring") || "Operação não concluída.",
    correlationId: text(fault,"correlationId"),
    request:xml, response:bruto
  });

  if (!res.ok) throw new Falha({ tipo:"http", errorCode:"HTTP " + res.status,
    errorMessage:"O serviço respondeu de forma inesperada. Tente novamente dentro de instantes.",
    request:xml, response:bruto });

  return { doc, bruto };
}