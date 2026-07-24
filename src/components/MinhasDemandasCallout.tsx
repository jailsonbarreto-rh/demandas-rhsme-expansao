import React from 'react';

interface MinhasDemandasCalloutProps {
  onOpen: () => void;
}

export const MinhasDemandasCallout: React.FC<MinhasDemandasCalloutProps> = ({ onOpen }) => (
  <section className="minhas-demandas-callout" aria-labelledby="minhas-demandas-title">
    <div className="minhas-demandas-callout-icon" aria-hidden="true">
      <i className="fa-solid fa-folder-open" />
    </div>

    <div className="minhas-demandas-callout-copy">
      <h2 id="minhas-demandas-title">Minhas demandas</h2>
      <p>Acompanhe sua carteira de processos.</p>
    </div>

    <button
      type="button"
      className="btn btn-primary minhas-demandas-callout-action"
      onClick={onOpen}
    >
      <span>Acessar minha carteira</span>
      <i className="fa-solid fa-arrow-right" aria-hidden="true" />
    </button>
  </section>
);
