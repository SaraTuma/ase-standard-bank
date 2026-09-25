const Esqueleto = ({ n = 3 }) => (
  <div style={{ display:"grid", gap:11, padding:"6px 0" }} aria-hidden="true">
    {Array.from({length:n}).map((_,i) => <div className="sk" key={i} style={{ width:(100-i*11)+"%" }} />)}
  </div>
);