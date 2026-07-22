import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Demanda } from '../types';
import { editarDemandaSchema, type EditarDemandaValues } from '../validation/demandaSchemas';
import { DateMaskInput } from './DateMaskInput';
import { AppDialog } from './ui/AppDialog';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { FormError } from './ui/FormError';

interface ModalEditarProps {
  demanda: Demanda;
  onClose: () => void;
  onSalvar: (demandaId: number, values: EditarDemandaValues) => void | boolean | Promise<void | boolean>;
}

export const ModalEditar: React.FC<ModalEditarProps> = ({ demanda, onClose, onSalvar }) => {
  const [confirmClose, setConfirmClose] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EditarDemandaValues>({
    resolver: zodResolver(editarDemandaSchema),
    defaultValues: {
      assunto: demanda.assunto,
      responsavel: demanda.responsavel || '',
      limite1: demanda.limite1 || '',
      limite2: demanda.limite2 || '',
      setor: demanda.setor || '',
      proximaAcao: demanda.proximaAcao || '',
      proximaAcaoEm: demanda.proximaAcaoEm || '',
      justificativa: '',
    },
  });

  const requestClose = () => {
    if (isDirty && !isSubmitting) setConfirmClose(true);
    else onClose();
  };

  const submit = handleSubmit(async (values) => {
    await onSalvar(demanda.id, values);
  });

  return (
    <>
      <AppDialog title="Editar Dados da Demanda" onClose={requestClose}>
        <form onSubmit={(event) => { void submit(event); }} noValidate>
          <div className="modal-body">
            <div className="form-grid-modal">
              <div className="input-container-floating col-full read-only-field">
                <input type="text" id="edit_id" className="form-control" value={`ID: ${demanda.id}`} readOnly />
              </div>
              <div className="input-container-floating col-full read-only-field">
                <input type="text" id="edit_numero" className="form-control" value={`Número: ${demanda.numero}`} readOnly />
              </div>
              <div className="input-container-floating col-full read-only-field">
                <input type="text" id="edit_tipo" className="form-control" value={`Tipo: ${demanda.tipo}`} readOnly />
              </div>

              <div className="input-container-floating col-full">
                <input
                  type="text"
                  id="edit_assunto"
                  placeholder=" "
                  {...register('assunto')}
                  className={errors.assunto ? 'field-invalid' : ''}
                  aria-invalid={Boolean(errors.assunto)}
                  aria-describedby={errors.assunto ? 'edit-assunto-error' : undefined}
                />
                <label htmlFor="edit_assunto">Assunto</label>
                <FormError id="edit-assunto-error" message={errors.assunto?.message} />
              </div>

              <div className="input-container-floating col-full">
                <input type="text" id="edit_responsavel" placeholder=" " {...register('responsavel')} />
                <label htmlFor="edit_responsavel">Responsável</label>
              </div>

              <Controller
                name="limite1"
                control={control}
                render={({ field, fieldState }) => (
                  <DateMaskInput id="edit_limite1" label="Prazo interno" value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
                )}
              />
              <Controller
                name="limite2"
                control={control}
                render={({ field, fieldState }) => (
                  <DateMaskInput id="edit_limite2" label="Prazo final" value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
                )}
              />

              <div className="input-container-floating col-full">
                <input type="text" id="edit_setor" placeholder=" " {...register('setor')} />
                <label htmlFor="edit_setor">Setor</label>
              </div>

              {demanda.status !== 'Encerrado' && (
                <>
                  <div className="input-container-floating col-full">
                    <textarea
                      id="edit_proxima_acao"
                      placeholder=" "
                      {...register('proximaAcao')}
                      className={errors.proximaAcao ? 'field-invalid' : ''}
                      aria-invalid={Boolean(errors.proximaAcao)}
                    />
                    <label htmlFor="edit_proxima_acao">Próxima ação</label>
                    <FormError message={errors.proximaAcao?.message} />
                  </div>
                  <Controller
                    name="proximaAcaoEm"
                    control={control}
                    render={({ field, fieldState }) => (
                      <DateMaskInput id="edit_proxima_acao_em" label="Data de acompanhamento" value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
                    )}
                  />
                </>
              )}

              <div className="input-container-floating col-full">
                <textarea
                  id="edit_justificativa"
                  placeholder=" "
                  {...register('justificativa')}
                  className={errors.justificativa ? 'field-invalid' : ''}
                  aria-invalid={Boolean(errors.justificativa)}
                  aria-describedby={errors.justificativa ? 'edit-justificativa-error' : undefined}
                />
                <label htmlFor="edit_justificativa">Justificativa da edição</label>
                <FormError id="edit-justificativa-error" message={errors.justificativa?.message} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} aria-busy={isSubmitting}>
              <i className={`fa-solid ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`} aria-hidden="true" />
              {isSubmitting ? 'Salvando…' : 'Salvar Alterações'}
            </button>
            <button type="button" className="btn" onClick={requestClose} disabled={isSubmitting}>
              <i className="fa-solid fa-xmark" aria-hidden="true" /> Cancelar
            </button>
          </div>
        </form>
      </AppDialog>

      <ConfirmDialog
        open={confirmClose}
        title="Descartar alterações?"
        description="Há informações alteradas que ainda não foram salvas."
        confirmLabel="Descartar alterações"
        onConfirm={onClose}
        onOpenChange={setConfirmClose}
      />
    </>
  );
};
