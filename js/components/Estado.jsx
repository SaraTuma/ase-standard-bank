const NIVEL = {
  EXECUTADA:"ok", SUCESSO:"ok", ACTIVA:"ok", ACTIVO:"ok", ATIVO:"ok", REGISTADO:"ok",
  REMOVIDO:"flat", AGENDADA:"warn", EM_ANALISE:"warn", PENDENTE:"warn",
  PENDENTE_REVISAO:"warn", BLOQUEADO:"warn", BLOQUEADA:"warn",
  RECUSADA:"bad", CANCELADO:"bad", CANCELADA:"bad"
};

const Estado = ({ valor }) => !valor ? null :
  <span className={"pill " + (NIVEL[String(valor).toUpperCase()] || "flat")}>
    {String(valor).replace(/_/g," ")}</span>;