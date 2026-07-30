import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Demanda, StatusTransitionInput } from '../types';
import { statusDemandaSchema, statusValues, type StatusDemandaValues } from '../validation/demandaSchemas';
import { DateMaskInput } from './DateMaskInput';
import { PastFollowUpJustification } from './PastFollowUpJustification';
import { AppDialog } from './ui/AppDialog';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { FormError } from './ui/FormError';

interface ModalStatusProps {
  demanda: Demanda;
  onClose: () => void;
  onAtualizar: (demandaId: number, input: StatusTransitionInput) => void | boolean | Promise<void | boolean>;
}

export const ModalStatus: React.FC<ModalStatusProps> = ({ demanda, onClose, onAtualizar }) => {
  const [confirmClose, setConfirmClose] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<StatusDemandaValues>({
    resolver: zodResolver(statusDemandaSchema),
    defaultValues: {
      status: demanda.status,
      comentario: '',
      proximaAcao: demanda.proximaAcao,
      proximaAcaoEm: demanda.proximaAcaoEm,
      proximaAcaoJustificativa: '',
    },
  });
  const selectedStatus = watch('status');
  const followUpDate = watch('proximaAcaoEm');

  const requestClose = () => {
    if (isDirty && !isSubmitting) setConfirmClose(true);
    else onClose();
  };

  const submit = handleSubmit(async (values) => {
    await onAtualizar(demanda.id, values);
  });

  return (
    <>
      <AppDialog title="Atualizar Status" onClose={requestClose} contentClassName="modal-compact">
        <form onSubmit={(event) => { void submit(event); }} noValidate>
          <div className="modal-body">
            <div className="form-stack">
              <div>
                <label htmlFor="modal_status_select" className="input-label-externa">Status da Demanda</label>
                <select id="modal_status_select" className="form-select" {...register('status')}>
                  {statusValues.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <FormError message={errors.status?.message} />
              </div>
              <div>
                <label htmlFor="modal_status_comentario" className="input-label-externa">Comentário / Observação</label>
                <textarea
                  id="modal_status_comentario"
                  className={`form-control status-comment ${errors.comentario ? 'field-invalid' : ''}`.trim()}
                  placeholder="Descreva a movimentação e o motivo da mudança de status..."
                  {...register('comentario')}
                  aria-invalid={Boolean(errors.comentario)}
                  aria-describedby={errors.comentario ? 'status-comentario-error' : undefined}
                />
                <FormError id="status-comentario-error" message={errors.comentario?.message} />
              </div>
              {selectedStatus !== 'Encerrado' && (
                <>
                  <div>
                    <label htmlFor="modal_status_proxima_acao" className="input-label-externa">Próxima providência</label>
                    <textarea
                      id="modal_status_proxima_acao"
                      className={`form-control status-comment ${errors.proximaAcao ? 'field-invalid' : ''}`.trim()}
                      placeholder="Informe a providência ou verificação seguinte..."
                      {...register('proximaAcao')}
                      aria-invalid={Boolean(errors.proximaAcao)}
                      aria-describedby={errors.proximaAcao ? 'status-proxima-acao-error' : undefined}
                    />
                    <FormError id="status-proxima-acao-error" message={errors.proximaAcao?.message} />
                  </div>
                  <Controller
                    name="proximaAcaoEm"
                    control={control}
                    render={({ field, fieldState }) => (
                      <DateMaskInput
                        id="modal_status_proxima_acao_em"
                        label="Data da próxima providência"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                  <Controller
                    name="proximaAcaoJustificativa"
                    control={control}
                    render={({ field, fieldState }) => (
                      <PastFollowUpJustification
                        id="modal_status_proxima_acao_justificativa"
                        date={followUpDate}
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} aria-busy={isSubmitting}>
              <i className={`fa-solid ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`} aria-hidden="true" />
              {isSubmitting ? 'Atualizando…' : 'Atualizar'}
            </button>
            <button type="button" className="btn" onClick={requestClose} disabled={isSubmitting}>
              <i className="fa-solid fa-xmark" aria-hidden="true" /> Cancelar
            </button>
          </div>
        </form>
      </AppDialog>

      <ConfirmDialog
        open={confirmClose}
        title="Descartar alteração de status?"
        description="O status, o comentário ou a próxima providência ainda não foram registrados."
        confirmLabel="Descartar alterações"
        onConfirm={onClose}
        onOpenChange={setConfirmClose}
      />
    </>
  );
};
