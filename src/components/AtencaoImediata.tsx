import React from 'react';
import { Demanda, ComentarioHistorico } from '../types';

interface AtencaoImediataProps {
  demandas: Demanda[];
  historico: ComentarioHistorico[];
  onOpenEditar: (demanda: Demanda) => void;
}

interface ItemCritico {
  tipo: 'vencido' | 'hoje' | 'assinatura';
  tituloAlerta: string;
  demanda: Demanda;
}

export const AtencaoImediata: React.FC<AtencaoImediataProps> = ({
  demandas,
  historico,
  onOpenEditar
}) => {
  
  // --- Funções Auxiliares de Datas ---
  
  // Converte dd/mm/aaaa para objeto Date
  const parseDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr || dateStr === 'dd/mm/aaaa') return null;
    const partes = dateStr.split('/');
    if (partes.length !== 3) return null;
    const day = parseInt(partes[0], 10);
    const month = parseInt(partes[1], 10) - 1; // 0-indexed
    const year = parseInt(partes[2], 10);
    return new Date(year, month, day);
  };

  // Retorna a string do dia de hoje (dd/mm/aaaa)
  const getTodayStr = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Converte data e hora de string (dd/mm/aaaa, hh:mm:ss) para objeto Date
  const parseDateTime = (dateTimeStr: string): Date | null => {
    try {
      if (!dateTimeStr) return null;
      // Trata formatos "dd/mm/aaaa, hh:mm:ss" ou "dd/mm/aaaa hh:mm:ss" ou ISO
      const limpo = dateTimeStr.replace(',', '').trim();
      const partesEspaco = limpo.split(' ');
      if (partesEspaco.length < 1) return null;
      
      const partesData = partesEspaco[0].split('/');
      if (partesData.length !== 3) return null;
      const day = parseInt(partesData[0], 10);
      const month = parseInt(partesData[1], 10) - 1;
      const year = parseInt(partesData[2], 10);
      
      let hours = 0, minutes = 0, seconds = 0;
      if (partesEspaco.length > 1) {
        const partesHora = partesEspaco[1].split(':');
        hours = parseInt(partesHora[0] || '0', 10);
        minutes = parseInt(partesHora[1] || '0', 10);
        seconds = parseInt(partesHora[2] || '0', 10);
      }
      return new Date(year, month, day, hours, minutes, seconds);
    } catch {
      return null;
    }
  };

  // --- Processamento de Itens Críticos ---

  const obterItensCriticos = (): ItemCritico[] => {
    const itens: ItemCritico[] = [];
    const hoje = new Date();
    const hojeZerado = new Date(hoje.getFullYear(), hoje.getMonth(), todayDateOnly(hoje));
    
    function todayDateOnly(d: Date) {
      return d.getDate();
    }

    const hojeStr = getTodayStr();

    // Filtra demandas que não estão encerradas
    const demandasAtivas = demandas.filter(d => d.status !== 'Encerrado');

    // 1. Processo vencido mais antigo
    const vencidos = demandasAtivas.filter(d => {
      if (!d.limite2) return false;
      const dataLimite = parseDate(d.limite2);
      if (!dataLimite) return false;
      return dataLimite < hojeZerado;
    });

    if (vencidos.length > 0) {
      // Ordena por limite2 mais antigo (menor data)
      vencidos.sort((a, b) => {
        const dateA = parseDate(a.limite2)!;
        const dateB = parseDate(b.limite2)!;
        return dateA.getTime() - dateB.getTime();
      });

      const maisAntigo = vencidos[0];
      const dataLimite = parseDate(maisAntigo.limite2)!;
      const diffTime = Math.abs(hojeZerado.getTime() - dataLimite.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      itens.push({
        tipo: 'vencido',
        tituloAlerta: `Vencida há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`,
        demanda: maisAntigo
      });
    }

    // 2. Demanda que vence hoje
    const vencendoHoje = demandasAtivas.filter(d => d.limite2 === hojeStr);
    if (vencendoHoje.length > 0) {
      // Pega a primeira demanda que vence hoje
      itens.push({
        tipo: 'hoje',
        tituloAlerta: 'Vence hoje',
        demanda: vencendoHoje[0]
      });
    }

    // 3. Demanda para assinatura há mais tempo
    const paraAssinatura = demandas.filter(d => d.status === 'Para Assinatura');
    if (paraAssinatura.length > 0) {
      const prazosAssinatura = paraAssinatura.map(d => {
        // Busca o primeiro histórico onde foi alterada para "Para Assinatura"
        const logsDemanda = historico
          .filter(h => h.demandaId === d.id && h.status_novo === 'Para Assinatura')
          .sort((a, b) => {
            const dateA = parseDateTime(a.data_hora);
            const dateB = parseDateTime(b.data_hora);
            if (!dateA || !dateB) return 0;
            return dateA.getTime() - dateB.getTime(); // primeiro log primeiro
          });

        const dataEntrada = logsDemanda.length > 0 ? parseDateTime(logsDemanda[0].data_hora) : null;
        return {
          demanda: d,
          dataEntrada,
          // Fallback para IDs menores (criadas antes no LocalStorage)
          fallbackOrder: d.id
        };
      });

      // Ordenar: as que têm data de entrada mais antiga no topo; se não, fallback por ID
      prazosAssinatura.sort((a, b) => {
        if (a.dataEntrada && b.dataEntrada) {
          return a.dataEntrada.getTime() - b.dataEntrada.getTime();
        }
        if (a.dataEntrada) return -1;
        if (b.dataEntrada) return 1;
        return a.fallbackOrder - b.fallbackOrder; // menor ID primeiro
      });

      const maisAntigaAssinatura = prazosAssinatura[0];
      let tituloAlerta = 'Aguardando assinatura';

      if (maisAntigaAssinatura.dataEntrada) {
        const diffTime = Math.abs(hoje.getTime() - maisAntigaAssinatura.dataEntrada.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
          tituloAlerta = `Para assinatura há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
        } else {
          tituloAlerta = 'Aguardando assinatura desde hoje';
        }
      }

      itens.push({
        tipo: 'assinatura',
        tituloAlerta,
        demanda: maisAntigaAssinatura.demanda
      });
    }

    return itens;
  };

  const itensCriticos = obterItensCriticos();

  // Se não houver itens críticos, desaparece completamente
  if (itensCriticos.length === 0) return null;

  return (
    <div className="atencao-secao">
      <div className="atencao-header">
        <i className="fa-solid fa-circle-exclamation" style={{ color: 'var(--primary-color)', fontSize: '0.875rem' }}></i>
        <h2>Atenção agora</h2>
      </div>
      
      <div className="atencao-painel-unico">
        {itensCriticos.map((item, idx) => (
          <div 
            key={`${item.tipo}-${item.demanda.id}-${idx}`} 
            className="atencao-linha-alerta"
          >
            <div className="alerta-info-grupo">
              <span className={`alerta-prazo-tag ${item.tipo}`}>
                {item.tituloAlerta}
              </span>
              <div className="alerta-detalhe">
                <span className="alerta-numero">{item.demanda.numero}</span>
                <span className="alerta-assunto" title={item.demanda.assunto}>
                  {item.demanda.assunto}
                </span>
              </div>
            </div>
            
            <button 
              type="button" 
              className="btn-alerta-abrir"
              onClick={() => onOpenEditar(item.demanda)}
              title={`Abrir detalhes do processo ${item.demanda.numero}`}
            >
              <span>Abrir</span>
              <i className="fa-solid fa-arrow-right-long" style={{ fontSize: '0.75rem' }}></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
