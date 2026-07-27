import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import type { ComentarioHistorico, Demanda } from '../types';
import { presentHistoryEvent } from '../domain/historyPresentation';
import { getPrazoFinalSemantics } from '../utils/date';
import { isClosed } from '../domain/workSemantics';

interface DemandDetailDrawerProps {
  demanda: Demanda | null;
  historico: ComentarioHistorico[];
  open: boolean;
  nestedDialogOpen?: boolean;
  canEdit: boolean;
  onClose: () => void;
  onEdit: () => void;
  onStatus: () => void;
}

function badgeClass(status: string) {
  if (status === 'Para Assinatura') return 'badge assinatura';
  if (status === 'Encerrado') return 'badge encerrado';
  if (status === 'Tramitado') return 'badge tramitado';
  if (status === 'Ajustar') return 'badge ajustar';
  if (status === 'Sobrestado') return 'badge sobrestado';
  return 'badge aguardando';
}

function MetaLabel({ children }: { children: ReactNode }) {
  return (
    <span style={{ fontSize: '0.688rem', fontWeight: 600, color: 'var(--text-muted)' }}>
      {children}
    </span>
  );
}

export function DemandDetailDrawer({
  demanda,
  historico,
  open,
  nestedDialogOpen = false,
  canEdit,
  onClose,
  onEdit,
  onStatus,
}: DemandDetailDrawerProps) {
  const reduceMotion = useReducedMotion();
  if (!demanda) return null;
  const prazo = getPrazoFinalSemantics(demanda.limite2);
  const history = historico.filter((item) => item.demandaId === demanda.id);

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="drawer-overlay"
                inert={nestedDialogOpen ? true : undefined}
                aria-hidden={nestedDialogOpen ? 'true' : undefined}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.16 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.aside
                className="drawer-content"
                initial={reduceMotion ? false : { x: 28, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={reduceMotion ? undefined : { x: 28, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="drawer-header">
                  <Dialog.Title asChild><h2>Processo nº {demanda.numero}</h2></Dialog.Title>
                  <Dialog.Close asChild>
                    <button type="button" className="btn-drawer-close" title="Fechar painel de detalhes" aria-label="Fechar painel de detalhes">
                      <i className="fa-solid fa-xmark" aria-hidden="true" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="drawer-body" role="region" tabIndex={0} aria-label="Conteúdo detalhado da demanda">
                  <section className="drawer-section">
                    <h3>Identificação</h3>
                    <div className="drawer-meta-grid">
                      <div className="drawer-meta-item full-width"><MetaLabel>Assunto</MetaLabel><span className="value strong-value">{demanda.assunto}</span></div>
                      <div className="drawer-meta-item"><MetaLabel>Tipo</MetaLabel><span className="value">{demanda.tipo}</span></div>
                      <div className="drawer-meta-item"><MetaLabel>Classificação</MetaLabel><span className="value">{demanda.classificacao || '—'}</span></div>
                    </div>
                  </section>

                  <section className="drawer-section">
                    <h3>Responsabilidade</h3>
                    <div className="drawer-meta-grid">
                      <div className="drawer-meta-item"><MetaLabel>Responsável Atual</MetaLabel><span className="value strong-value">{demanda.responsavel || 'Não atribuído'}</span></div>
                      <div className="drawer-meta-item"><MetaLabel>Setor Vinculado</MetaLabel><span className="value">{demanda.setor || '—'}</span></div>
                    </div>
                  </section>

                  <section className="drawer-section">
                    <h3>Prazos</h3>
                    <div className="drawer-meta-grid">
                      <div className="drawer-meta-item"><MetaLabel>Prazo de Análise (Interno)</MetaLabel><span className="value">{demanda.limite1 || '—'}</span></div>
                      <div className="drawer-meta-item">
                        <MetaLabel>Prazo Final</MetaLabel>
                        <div className="prazo-final-container drawer-prazo">
                          <span className="value strong-value">{prazo.data}</span>
                          {prazo.label && !isClosed(demanda) && <span className={`prazo-status-label ${prazo.classe}`}>{prazo.label}</span>}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="drawer-section">
                    <h3>Situação Atual</h3>
                    <span className={badgeClass(demanda.status)}>{demanda.status}</span>
                  </section>

                  <section className="drawer-section drawer-history-section">
                    <h3>Histórico da demanda</h3>
                    {history.length > 0 ? (
                      <div className="timeline-container drawer-timeline">
                        {history.map((item, index) => {
                          const presentation = presentHistoryEvent(item);
                          return (
                            <div key={item.id} className={`timeline-item ${index === 0 ? 'latest' : ''}`}>
                              <div className="timeline-circle" />
                              <div className="timeline-content">
                                <div className="timeline-header">
                                  <span className="timeline-meta">{item.data_hora}</span>
                                  <span className={badgeClass(item.status_novo)}>{item.status_novo}</span>
                                </div>
                                <div className="timeline-meta" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  <span className="timeline-event-type">{presentation.label}</span>
                                  <span className="timeline-setor">{item.setor || 'CTRH'}</span>
                                </div>
                                <div className="timeline-comment">{presentation.comment}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : <span className="empty-inline">Nenhum registro no histórico.</span>}
                  </section>
                </div>

                <div className="drawer-footer">
                  {canEdit && <button type="button" className="btn btn-secondary-outline" onClick={onStatus}><i className="fa-solid fa-rotate-left" aria-hidden="true" /> Status</button>}
                  {canEdit && <button type="button" className="btn btn-secondary-outline" onClick={onEdit}><i className="fa-solid fa-pen-to-square" aria-hidden="true" /> Editar</button>}
                  <Dialog.Close asChild><button type="button" className="btn btn-primary"><i className="fa-solid fa-check" aria-hidden="true" /> Fechar</button></Dialog.Close>
                </div>
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
