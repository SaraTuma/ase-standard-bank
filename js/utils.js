const vazio = v => v === null || v === undefined || v === "" || (typeof v === "number" && isNaN(v));

const kz = (n, s) => vazio(n) ? "—"
  : Number(n).toLocaleString("pt-PT",{minimumFractionDigits:2,maximumFractionDigits:2}) + (s ? "" : " Kz");

const pctF = n => vazio(n) ? "—"
  : (n > 0 ? "+" : n < 0 ? "\u2212" : "") + Math.abs(n).toLocaleString("pt-PT",{maximumFractionDigits:1}) + "%";

const dt = s => { 
  const d = new Date(s); 
  return isNaN(d) ? (s||"—") : d.toLocaleString("pt-PT",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}); 
};

const dia = s => { 
  const d = new Date(s); 
  return isNaN(d) ? (s||"—") : d.toLocaleDateString("pt-PT",{day:"2-digit",month:"2-digit",year:"numeric"}); 
};

const diaLongo = s => { 
  const d = new Date(s); 
  return isNaN(d) ? (s||"—") : d.toLocaleDateString("pt-PT",{weekday:"long",day:"numeric",month:"long",year:"numeric"}); 
};

const ibanF = s => !s ? "—" : String(s).replace(/\s/g,"").replace(/(.{4})/g,"$1 ").trim();

const ult4 = s => { 
  const d = String(s||"").replace(/\D/g,""); 
  return d.length>=4 ? d.slice(-4) : d.padStart(4,"0"); 
};

const hoje = () => new Date().toISOString().slice(0,10);

const maisDias = n => new Date(Date.now()+n*864e5).toISOString().slice(0,10);

const NOMES = {
  SAUDE:"Saúde", ALIMENTACAO:"Alimentação", TRANSPORTE:"Transporte", TRANSPORTES:"Transportes",
  TAXI:"Táxi", PAGAMENTO:"Pagamentos", PAGAMENTOS:"Pagamentos", LAZER:"Lazer", OUTROS:"Outros",
  SUPERMERCADO:"Supermercado", LEVANTAMENTOS:"Levantamentos", TELECOMUNICACOES:"Telecomunicações",
  RENDIMENTOS:"Rendimentos", TRANSFERENCIAS:"Transferências", UNKNOWN:"Outros", RESUMO:"Resumo",
  CORRENTE:"Conta à ordem", POUPANCA:"Conta poupança"
};

const cat = c => {
  if (!c) return "Outros";
  const k = String(c).toUpperCase().replace(/\s+/g,"_");
  if (NOMES[k]) return NOMES[k];
  const t = String(c).toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};