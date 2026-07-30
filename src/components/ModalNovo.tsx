import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { DeadlineState, PerfilMinimo } from '../types';
import { demandaFormSchema, type DemandaFormValues, statusValues, tipoValues } from '../validation/demandaSchemas';
import { isValidDateString } from '../utils/date';
import { DateMaskInput } from './DateMaskInput';
import { DeadlineControl } from './DeadlineControl';
import { PastFollowUpJustification } from './PastFollowUpJustification';
import { AppDialog } from './ui/AppDialog';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { InfoDialog } from './ui/InfoDialog';
import { FormError } from './ui/FormError';
import { classificacaoValues } from '../constants/demandaOptions';

interface ModalNovoProps {
  responsaveis: PerfilMinimo[];
  onClose: () => void;
  onSalvar: (demanda: DemandaFormValues) => void | Promise<void>;
}

export const ModalNovo: React.FC<ModalNovoProps> = ({ responsaveis, onClose, onSalvar }) => {
  const [confirmClose, setConfirmClose] = useState(false);
  const [deadlineRequiredAlert, setDeadlineRequiredAlert] = useState(false);
  const responsaveisOrdenados = useMemo(
    () => [...responsaveis].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [responsaveis],
  );
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setError,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<DemandaFormValues>({
    resolver: zodResolver(demandaFormSchema),
    defaultValues: {
      tipo: undefined,
      numero: '',
      assunto: '',
      responsavelId: '',
      limite1Situacao: 'definido',
      limite1: '',
      limite2Situacao: undefined,
      limite2: '',
      status: undefined,
      setor: '',
      classificacao: '',
      proximaAcao: '',
      proximaAcaoEm: '',
      proximaAcaoJustificativa: '',
    },
  });
  const limite1State = watch('limite1Situacao');
  const limite2State = (watch('limite2Situacao') ?? 'nao_informado') as DeadlineState;
  const selectedStatus = watch('status');
  const followUpDate = watch('proximaAcaoEm');

  const requestClose = () => {
    if (isDirty && !isSubmitting) setConfirmClose(true);
    else onClose();
  };

  const submit = handleSubmit(
    async (values) => { await onSalvar(values); },
    (invalid) => {
      const internalDeadline = getValues('limite1');
      if (invalid.limite1 || invalid.limite1Situacao || !isValidDateString(internalDeadline)) {
        if (!invalid.limite1 && !invalid.limite1Situacao) {
          setError('limite1', {
            type: 'manual',
            message: 'Informe uma data válida para o prazo definido.',
          });
        }
        setDeadlineRequiredAlert(true);
      }
    },
  );

  return (
    <>
      <AppDialog title="Nova Demanda" onClose={requestClose}>
        <form onSubmit={(event) => { void submit(event); }} noValidate>
          <div className="modal-body">
            <div className="form-grid-modal">
              <div className="input-container-floating col-full">
                <select
                  id="novo-tipo"
                  {...register('tipo')}
                  className={errors.tipo ? 'field-invalid' : ''}
                  aria-invalid={Boolean(errors.tipo)}
                  aria-describedby={errors.tipo ? 'novo-tipo-error' : undefined}
                >
                  <option value="" />
                  {tipoValues.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
                </select>
                <label htmlFor="novo-tipo">Tipo</label>
                <FormError id="novo-tipo-error" message={errors.tipo?.message} />
              </div>

              <div className="input-container-floating col-full">
                <input
                  type="text"
                  id="novo-numero"
                  placeholder=" "
                  {...register('numero')}
                  className={errors.numero ? 'field-invalid' : ''}
                  aria-invalid={Boolean(errors.numero)}
                  aria-describedby={errors.numero ? 'novo-numero-error' : undefined}
                />
                <label htmlFor="novo-numero">Número</label>
                <FormError id="novo-numero-error" message={errors.numero?.message} />
              </div>

              <div className="input-container-floating col-full">
                <input
                  type="text"
                  id="novo-assunto"
                  placeholder=" "
                  {...register('assunto')}
                  className={errors.assunto ? 'field-invalid' : ''}
                  aria-invalid={Boolean(errors.assunto)}
                  aria-describedby={errors.assunto ? 'novo-assunto-error' : undefined}
                />
                <label htmlFor="novo-assunto">Assunto</label>
                <FormError id="novo-assunto-error" message={errors.assunto?.message} />
              </div>

              <div className="input-container-floating col-full">
                <select
                  id="novo-responsavel"
                  {...register('responsavelId')}
                  className={errors.responsavelId ? 'field-invalid' : ''}
                  aria-invalid={Boolean(errors.responsavelId)}
                  aria-describedby={errors.responsavelId ? 'novo-responsavel-error' : undefined}
                >
                  <option value="">Sem responsável definido</option>
                  {responsaveisOrdenados.map((perfil) => (
                    <option key={perfil.id} value={perfil.id}>
                      {perfil.setor ? `${perfil.nome} — ${perfil.setor}` : perfil.nome}
                    </option>
                  ))}
                </select>
                <label htmlFor="novo-responsavel">Responsável</label>
                <FormError id="novo-responsavel-error" message={errors.responsavelId?.message} />
              </div>

              <input type="hidden" {...register('limite1Situacao')} />
              <Controller
                name="limite1"
                control={control}
                render={({ field, fieldState }) => (
                  <DeadlineControl
                    idPrefix="novo-limite1"
                    label="Prazo interno"
                    state={limite1State}
                    date={field.value}
                    allowedStates={['definido']}
                    onStateChange={(state) => setValue('limite1Situacao', state as 'definido', { shouldDirty: true, shouldValidate: true })}
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
                    idPrefix="novo-limite2"
                    label="Prazo final"
                    state={limite2State}
                    date={field.value}
                    allowedStates={['definido', 'nao_se_aplica']}
                    onStateChange={(state) => setValue('limite2Situacao', state as 'definido' | 'nao_se_aplica', { shouldDirty: true, shouldValidate: true })}
                    onDateChange={field.onChange}
                    onDateBlur={field.onBlur}
                    stateError={errors.limite2Situacao?.message}
                    dateError={fieldState.error?.message}
                  />
                )}
              />

              <div className="input-container-floating col-full">
                <select
                  id="novo-status"
                  {...register('status')}
                  className={errors.status ? 'field-invalid' : ''}
                  aria-invalid={Boolean(errors.status)}
                  aria-describedby={errors.status ? 'novo-status-error' : undefined}
                >
                  <option value="" />
                  {statusValues.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <label htmlFor="novo-status">Status</label>
                <FormError id="novo-status-error" message={errors.status?.message} />
              </div>

              <div className="input-container-floating col-full">
                <input type="text" id="novo-setor" placeholder=" " {...register('setor')} />
                <label htmlFor="novo-setor">Setor (ex: E/CTRH)</label>
              </div>

              <div className="input-container-floating col-full">
                <select
                  id="novo-classificacao"
                  {...register('classificacao')}
                  className={errors.classificacao ? 'field-invalid' : ''}
                  aria-invalid={Boolean(errors.classificacao)}
                  aria-describedby={errors.classificacao ? 'novo-classificacao-error' : undefined}
                >
                  <option value="" />
                  {classificacaoValues.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <label htmlFor="novo-classificacao">Selecione a classificação</label>
                <FormError id="novo-classificacao-error" message={errors.classificacao?.message} />
              </div>

              {selectedStatus !== 'Encerrado' && (
                <>
                  <div className="input-container-floating col-full">
                    <textarea
                      id="novo-proxima-acao"
                      placeholder=" "
                      {...register('proximaAcao')}
                      className={errors.proximaAcao ? 'field-invalid' : ''}
                      aria-invalid={Boolean(errors.proximaAcao)}
                      aria-describedby={errors.proximaAcao ? 'novo-proxima-acao-error' : undefined}
                    />
                    <label htmlFor="novo-proxima-acao">Próxima providência</label>
                    <FormError id="novo-proxima-acao-error" message={errors.proximaAcao?.message} />
                  </div>

                  <Controller
                    name="proximaAcaoEm"
                    control={control}
                    render={({ field, fieldState }) => (
                      <DateMaskInput
                        id="novo-proxima-acao-em"
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
                        id="novo-proxima-acao-justificativa"
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
              {isSubmitting ? 'Salvando…' : 'Salvar'}
            </button>
            <button type="button" className="btn" onClick={requestClose} disabled={isSubmitting}>
              <i className="fa-solid fa-xmark" aria-hidden="true" /> Cancelar
            </button>
          </div>
        </form>
      </AppDialog>

      <InfoDialog
        open={deadlineRequiredAlert}
        title="Prazo interno obrigatório"
        description="Toda nova demanda deve possuir um prazo interno definido. Informe a data antes de salvar o cadastro."
        onOpenChange={setDeadlineRequiredAlert}
      />

      <ConfirmDialog
        open={confirmClose}
        title="Descartar alterações?"
        description="Os dados preenchidos ainda não foram salvos. Ao sair, essas alterações serão perdidas."
        confirmLabel="Descartar alterações"
        onConfirm={onClose}
        onOpenChange={setConfirmClose}
      />
    </>
  );
};