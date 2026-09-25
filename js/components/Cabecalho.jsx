const Cabecalho = ({ titulo, sub, children }) => (
  <div className="head"><div><h2>{titulo}</h2>{sub && <p>{sub}</p>}</div>{children}</div>
);