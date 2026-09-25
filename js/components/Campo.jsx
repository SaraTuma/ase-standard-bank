let seq = 0;
function Campo({ etiqueta, dica, tipo = "text", opcoes, valor, aoMudar, mono, ...p }) {
  const [id] = React.useState(() => "f" + (++seq));
  const c = { id, value: valor, onChange: e => aoMudar(e.target.value), ...p };
  return (
    <div className="field">
      <label htmlFor={id}>{etiqueta}</label>
      {opcoes ? <select {...c}>{opcoes.map(o => <option key={o.v} value={o.v}>{o.t}</option>)}</select>
              : <input type={tipo} className={mono ? "mono" : ""} {...c} />}
      {dica && <span className="hint">{dica}</span>}
    </div>
  );
}