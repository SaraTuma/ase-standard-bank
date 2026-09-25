const Botao = ({ ocupado, variante, children, className, ...p }) => (
  <button className={["btn", variante, className].filter(Boolean).join(" ")}
          disabled={p.disabled || ocupado} {...p}>
    {ocupado && <span className="spin" aria-hidden="true" />}{children}
  </button>
);