const RISCO = { BAIXO:"ok", MEDIO:"warn", "MÉDIO":"warn", ALTO:"bad" };

const Risco = ({ valor }) => !valor ? null :
  <span className={"pill " + (RISCO[String(valor).toUpperCase()] || "flat")}>
    Risco {String(valor).toLowerCase()}</span>;