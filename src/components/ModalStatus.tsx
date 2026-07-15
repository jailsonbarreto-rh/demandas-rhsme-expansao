import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Demanda } from '../types';
import { statusDemandaSchema, statusValues, type StatusDemandaValues } from '../validation/demandaSchemas';
import { AppDialog } from './ui/AppDialog';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { FormError } from './ui/FormError';

interface ModalStatusProps {
  demanda: Demanda;
  onClose: () => void;
  onAtualizar: (demandaId: number, novoStatus: Demanda['status'], comentario: string) => void | boolean | Promise<void | boolean>;
}

export const ModalStatus: React.FC<ModalStatusProps> = ({ demanda, onClose, onAtualizar }) => {
  const [confirmClose, setConfirmClose] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<StatusDemandaValues>({
    resolver: zodResolver(statusDemandaSchema),
    defaultValues: { status: demanda.status, comentario: '' },
  });

  const requestClose = () => {
    if (isDirty && !isSubmitting) setConfirmClose(true);
    else onClose();
  };

  const submit = handleSubmit(async (values) => {
    await onAtualizar(demanda.id, values.status, values.comentario);
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
                  placeholder="Descreva as atualizações realizadas para justificar a mudança de status..."
                  {...register('comentario')}
                  aria-invalid={Boolean(errors.comentario)}
                  aria-describedby={errors.comentario ? 'status-comentario-error' : undefined}
                />
                <FormError id="status-comentario-error" message={errors.comentario?.message} />
              </div>
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
        description="O status ou o comentário foram alterados e ainda não foram registrados."
        confirmLabel="Descartar alterações"
        onConfirm={onClose}
        onOpenChange={setConfirmClose}
      />
    </>
  );
};
