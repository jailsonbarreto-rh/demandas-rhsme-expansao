import React from 'react';

type CarteiraMode = 'geral' | 'pessoal';

interface CarteiraContextHeaderProps {
  mode: CarteiraMode;
  onSwitch: () => void;
}

const COPY: Record<CarteiraMode, {
  title: string;
  description: string;
  action: string;
  icon: string;
}> = {
  geral: {
    title: 'Todas as demandas',
    description: 'Consulte a carteira completa da equipe.',
    action: 'Ver minhas demandas',
    icon: 'fa-users',
  },
  pessoal: {
    title: 'Minhas demandas',
    description: 'Acompanhe sua carteira de processos.',
    action: 'Ver todas as demandas',
    icon: 'fa-folder-open',
  },
};

export const CarteiraContextHeader: React.FC<CarteiraContextHeaderProps> = ({ mode, onSwitch }) => {
  const copy = COPY[mode];

  return (
    <section className={`carteira-context-header ${mode}`} aria-labelledby="carteira-context-title">
      <div className="carteira-context-icon" aria-hidden="true">
        <i className={`fa-solid ${copy.icon}`} />
      </div>

      <div className="carteira-context-copy">
        <h2 id="carteira-context-title">{copy.title}</h2>
        <p>{copy.description}</p>
      </div>

      <button
        type="button"
        className="btn btn-primary carteira-context-action"
        onClick={onSwitch}
      >
        <span>{copy.action}</span>
        <i className="fa-solid fa-arrow-right-arrow-left" aria-hidden="true" />
      </button>
    </section>
  );
};
