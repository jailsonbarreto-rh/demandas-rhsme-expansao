import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { DeadlineState, Demanda, PerfilMinimo } from '../types';
import { createEditarDemandaSchema, type EditarDemandaValues } from '../validation/demandaSchemas';
import { DeadlineControl } from './DeadlineControl';
import { AppDialog } from './ui/AppDialog';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { FormError } from './ui/FormError';

interface ModalEditarProps {
  demanda: Demanda;
  responsaveis: PerfilMinimo[];
  onClose: () => void;
  onSalvar: (demandaId: number, values: EditarDemandaValues) => void | boolean | Promise<void | boolean>;
}

export const ModalEditar: React.FC<ModalEditarProps> = ({ demanda, responsaveis, onClose, onSalvar }) => {
  const [confirmClose, setConfirmClose] = useState(false);
  const responsaveisOrdenados = useMemo(
    () => [...responsaveis].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [responsaveis],
  );
  const schema = useMemo(() => createEditarDemandaSchema(demanda), [demanda]);
  const responsavelLegado = !demanda.responsavelId && demanda.responsavel.trim()
    ? demanda.responsavel.trim()
    : '';
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EditarDemandaValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      assunto: demanda.assunto,
      responsavelId: demanda.responsavelId ?? '',
      limite1Situacao: demanda.limite1Situacao,
      limite1: demanda.limite1 || '',
      limite2Situacao: demanda.limite2Situacao,
      limite2: demanda.limite2 || '',
      setor: demanda.setor || '',
      justificativa: '',
    },
  });
  const limite1State = watch('limite1Situacao');
  const limite2State = watch('limite2Situacao');
  const internalStates: DeadlineState[] = demanda.limite1Situacao === 'nao_informado'
    ? ['nao_informado', 'definido']
    : ['definido'];
  const finalStates: DeadlineState[] = demanda.limite2Situacao === 'nao_informado'
    ? ['nao_informado', 'definido', 'nao_se_aplica']
    : ['definido', 'nao_se_aplica'];

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

              {responsavelLegado && (
                <div className="input-container-floating col-full read-only-field">
                  <input
                    type="text"
                    id="edit_responsavel_legado"
                    className="form-control"
                    value={`Responsável legado: ${responsavelLegado}`}
                    readOnly
                  />
                </div>
              )}

              <div className="input-container-floating col-full">
                <select
                  id="edit_responsavel"
                  {...register('responsavelId')}
                  className={errors.responsavelId ? 'field-invalid' : ''}
                  aria-invalid={Boolean(errors.responsavelId)}
                  aria-describedby={errors.responsavelId ? 'edit-responsavel-error' : undefined}
                >
                  <option value="">Sem responsável definido</option>
                  {responsaveisOrdenados.map((perfil) => (
                    <option key={perfil.id} value={perfil.id}>
                      {perfil.setor ? `${perfil.nome} — ${perfil.setor}` : perfil.nome}
                    </option>
                  ))}
                </select>
                <label htmlFor="edit_responsavel">Responsável</label>
                <FormError id="edit-responsavel-error" message={errors.responsavelId?.message} />
              </div>

              <input type="hidden" {...register('limite1Situacao')} />
              <Controller
                name="limite1"
                control={control}
                render={({ field, fieldState }) => (
                  <DeadlineControl
                    idPrefix="edit-limite1"
                    label="Prazo interno"
                    state={limite1State}
                    date={field.value}
                    allowedStates={internalStates}
                    onStateChange={(state) => setValue('limite1Situacao', state, { shouldDirty: true, shouldValidate: true })}
                    onDateChange={field.onChange}
                    onDateBlur={field.onBlur}
                    stateError={errors.limite1Situacao?.message}
                    dateError={fieldState.error?.message}
                  />
                )}
              />

              <input type="hidden" {...register('limite2Situacao')} />
              <Controller
                name="limite2"
                control={control}
                render={({ field, fieldState }) => (
                  <DeadlineControl
                    idPrefix="edit-limite2"
                    label="Prazo final"
                    state={limite2State}
                    date={field.value}
                    allowedStates={finalStates}
                    onStateChange={(state) => setValue('limite2Situacao', state, { shouldDirty: true, shouldValidate: true })}
                    onDateChange={field.onChange}
                    onDateBlur={field.onBlur}
                    stateError={errors.limite2Situacao?.message}
                    dateError={fieldState.error?.message}
                  />
                )}
              />

              <div className="input-container-floating col-full">
                <input type="text" id="edit_setor" placeholder=" " {...register('setor')} />
                <label htmlFor="edit_setor">Setor</label>
              </div>

              <div className="edit-justification-guidance col-full">
                A primeira inclusão de um prazo ausente no legado não exige justificativa. Alterações de prazos já registrados e demais mudanças cadastrais permanecem justificadas e auditáveis.
              </div>
              <div className="input-container-floating col-full">
                <textarea
                  id="edit_justificativa"
                  placeholder=" "
                  {...register('justificativa')}
                  className={errors.justificativa ? 'field-invalid' : ''}
                  aria-invalid={Boolean(errors.justificativa)}
                  aria-describedby={errors.justificativa ? 'edit-justificativa-error' : undefined}
                />
                <label htmlFor="edit_justificativa">Justificativa da alteração, quando exigida</label>
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
