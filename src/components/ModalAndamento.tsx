import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Demanda, ProgressInput } from '../types';
import { progressMutationSchema } from '../validation/demandMutationSchemas';
import { DateMaskInput } from './DateMaskInput';
import { PastFollowUpJustification } from './PastFollowUpJustification';
import { AppDialog } from './ui/AppDialog';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { FormError } from './ui/FormError';

interface ModalAndamentoProps {
  demanda: Demanda;
  onClose: () => void;
  onRegistrar: (demandaId: number, input: ProgressInput) => void | boolean | Promise<void | boolean>;
}

export function ModalAndamento({ demanda, onClose, onRegistrar }: ModalAndamentoProps) {
  const [confirmClose, setConfirmClose] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProgressInput>({
    resolver: zodResolver(progressMutationSchema),
    defaultValues: {
      comentario: '',
      proximaAcao: demanda.proximaAcao,
      proximaAcaoEm: demanda.proximaAcaoEm,
      proximaAcaoJustificativa: '',
    },
  });
  const followUpDate = watch('proximaAcaoEm');

  const requestClose = () => {
    if (isDirty && !isSubmitting) setConfirmClose(true);
    else onClose();
  };

  const submit = handleSubmit(async (values) => {
    await onRegistrar(demanda.id, values);
  });

  return (
    <>
      <AppDialog title="Registrar andamento" onClose={requestClose} contentClassName="modal-compact">
        <form onSubmit={(event) => { void submit(event); }} noValidate>
          <div className="modal-body">
            <p className="dialog-description">
              O status permanece <strong>{demanda.status}</strong>. Registre o trabalho realizado e organize a próxima providência.
            </p>
            <div className="form-stack">
              <div>
                <label htmlFor="modal_andamento_comentario" className="input-label-externa">O que foi realizado</label>
                <textarea
                  id="modal_andamento_comentario"
                  className={`form-control status-comment ${errors.comentario ? 'field-invalid' : ''}`.trim()}
                  placeholder="Descreva a movimentação, contato ou análise realizada..."
                  {...register('comentario')}
                  aria-invalid={Boolean(errors.comentario)}
                  aria-describedby={errors.comentario ? 'andamento-comentario-error' : undefined}
                />
                <FormError id="andamento-comentario-error" message={errors.comentario?.message} />
              </div>
              <div>
                <label htmlFor="modal_andamento_proxima_acao" className="input-label-externa">Próxima providência</label>
                <textarea
                  id="modal_andamento_proxima_acao"
                  className={`form-control status-comment ${errors.proximaAcao ? 'field-invalid' : ''}`.trim()}
                  placeholder="Informe a providência ou verificação seguinte..."
                  {...register('proximaAcao')}
                  aria-invalid={Boolean(errors.proximaAcao)}
                  aria-describedby={errors.proximaAcao ? 'andamento-proxima-acao-error' : undefined}
                />
                <FormError id="andamento-proxima-acao-error" message={errors.proximaAcao?.message} />
              </div>
              <Controller
                name="proximaAcaoEm"
                control={control}
                render={({ field, fieldState }) => (
                  <DateMaskInput
                    id="modal_andamento_proxima_acao_em"
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
                    id="modal_andamento_proxima_acao_justificativa"
                    date={followUpDate}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} aria-busy={isSubmitting}>
              <i className={`fa-solid ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-list-check'}`} aria-hidden="true" />
              {isSubmitting ? 'Registrando…' : 'Registrar andamento'}
            </button>
            <button type="button" className="btn" onClick={requestClose} disabled={isSubmitting}>
              <i className="fa-solid fa-xmark" aria-hidden="true" /> Cancelar
            </button>
          </div>
        </form>
      </AppDialog>

      <ConfirmDialog
        open={confirmClose}
        title="Descartar andamento?"
        description="O trabalho realizado e a próxima providência ainda não foram registrados."
        confirmLabel="Descartar alterações"
        onConfirm={onClose}
        onOpenChange={setConfirmClose}
      />
    </>
  );
}
