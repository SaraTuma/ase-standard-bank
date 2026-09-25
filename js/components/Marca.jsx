function Marca({ t = 30, escuro, texto = true }) {
  const m = CONFIG.marca, ouro = "#BF8F26", base = escuro ? "#0B3A5E" : "#062A45";
  return (
    <span className={"logo" + (escuro ? " dark" : "")}>
      <svg width={t} height={t} viewBox="0 0 32 32" role="img" aria-label={m.sigla + ", " + m.banco}>
        <path d="M16 1.8 L28 6.6 V16.6 C28 23.4 22.8 28.2 16 30.2 C9.2 28.2 4 23.4 4 16.6 V6.6 Z" fill={base}/>
        <path d="M16 1.8 L28 6.6 V16.6 C28 23.4 22.8 28.2 16 30.2 C9.2 28.2 4 23.4 4 16.6 V6.6 Z"
              fill="none" stroke={ouro} strokeWidth="1" opacity=".5"/>
        <rect x="10"   y="19.6" width="12" height="2.1" rx="1" fill={ouro}/>
        <rect x="11.8" y="15.6" width="8.4" height="2.1" rx="1" fill={ouro} opacity=".8"/>
        <rect x="13.6" y="11.6" width="4.8" height="2.1" rx="1" fill="#FFF" opacity=".9"/>
      </svg>
      {texto && (
        <span>
          <span className="w" style={{ fontSize: t * .66, color: escuro ? "#fff" : "var(--ink)" }}>{m.sigla}</span>
          <span className="s">{m.banco}</span>
        </span>
      )}
    </span>
  );
}