import type { ComentarioHistorico, Demanda } from '../types';
import { presentHistoryEvent } from '../domain/historyPresentation';
import { AppDialog } from './ui/AppDialog';

interface AdminTrashDetailDialogProps {
  demanda: Demanda | null;
  historico: ComentarioHistorico[];
  autorExclusao: string;
  onClose: () => void;
}

function formatDateTime(value: string): string {
  if (!value) return 'Data não identificada';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminTrashDetailDialog({
  demanda,
  historico,
  autorExclusao,
  onClose,
}: AdminTrashDetailDialogProps) {
  if (!demanda) return null;
  const events = historico.filter((item) => item.demandaId === demanda.id);

  return (
    <AppDialog
      title="Demanda excluída"
      description={`Consulta somente leitura do processo ou documento ${demanda.numero}.`}
      onClose={onClose}
      contentClassName="admin-trash-dialog"
      footer={(
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            <i className="fa-solid fa-check" aria-hidden="true" /> Fechar
          </button>
        </div>
      )}
    >
      <div className="modal-body admin-trash-detail">
        <div className="admin-trash-readonly-note" role="note">
          <i className="fa-solid fa-lock" aria-hidden="true" />
          <div>
            <strong>Registro preservado para auditoria</strong>
            <span>Esta demanda permanece excluída e não pode ser editada ou restaurada pelo sistema.</span>
          </div>
        </div>

        <section className="admin-trash-detail-section" aria-labelledby="trash-audit-title">
          <h3 id="trash-audit-title">Dados da exclusão</h3>
          <dl className="admin-trash-detail-grid">
            <div><dt>Excluída em</dt><dd>{formatDateTime(demanda.deletedAt)}</dd></div>
            <div><dt>Excluída por</dt><dd>{autorExclusao}</dd></div>
            <div className="full-width"><dt>Motivo</dt><dd>{demanda.deletionReason || 'Motivo não identificado.'}</dd></div>
          </dl>
        </section>

        <section className="admin-trash-detail-section" aria-labelledby="trash-demand-title">
          <h3 id="trash-demand-title">Dados preservados da demanda</h3>
          <dl className="admin-trash-detail-grid">
            <div><dt>Processo / documento</dt><dd>{demanda.numero}</dd></div>
            <div><dt>Status no momento da exclusão</dt><dd>{demanda.status}</dd></div>
            <div className="full-width"><dt>Assunto</dt><dd>{demanda.assunto}</dd></div>
            <div><dt>Responsável</dt><dd>{demanda.responsavel || 'Não atribuído'}</dd></div>
            <div><dt>Setor</dt><dd>{demanda.setor || 'Não informado'}</dd></div>
            <div><dt>Classificação</dt><dd>{demanda.classificacao || 'Não informada'}</dd></div>
            <div><dt>Origem</dt><dd>{demanda.origem === 'legado' ? 'Dados importados' : 'Cadastrada no sistema'}</dd></div>
            <div className="full-width"><dt>Próxima providência preservada</dt><dd>{demanda.proximaAcao || 'Não informada'}</dd></div>
          </dl>
        </section>

        <section className="admin-trash-detail-section" aria-labelledby="trash-history-title">
          <h3 id="trash-history-title">Histórico completo</h3>
          {events.length === 0 ? (
            <p className="empty-inline">Nenhum evento histórico disponível.</p>
          ) : (
            <div className="admin-trash-history-list">
              {events.map((item) => {
                const presentation = presentHistoryEvent(item);
                return (
                  <article key={item.id} className="admin-trash-history-item">
                    <div className="admin-trash-history-heading">
                      <strong>{presentation.label}</strong>
                      <time>{item.data_hora}</time>
                    </div>
                    <p>{presentation.comment}</p>
                    <span>{item.setor || 'Setor não informado'} · {item.status_novo}</span>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppDialog>
  );
}
