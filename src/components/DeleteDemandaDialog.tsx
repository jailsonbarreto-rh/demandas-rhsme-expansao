import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { DeleteDemandaInput, Demanda } from '../types';
import { deleteMutationSchema } from '../validation/demandMutationSchemas';
import { FormError } from './ui/FormError';

interface DeleteDemandaDialogProps {
  demanda: Demanda | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (demandaId: number, input: DeleteDemandaInput) => void | Promise<void>;
}

export function DeleteDemandaDialog({
  demanda,
  onOpenChange,
  onConfirm,
}: DeleteDemandaDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DeleteDemandaInput>({
    resolver: zodResolver(deleteMutationSchema),
    defaultValues: { motivo: '' },
  });

  const close = () => {
    reset();
    onOpenChange(false);
  };

  const submit = handleSubmit(async (input) => {
    if (!demanda) return;
    await onConfirm(demanda.id, input);
    close();
  });

  return (
    <AlertDialog.Root open={Boolean(demanda)} onOpenChange={(open) => { if (!open) close(); }}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="modal-overlay radix-overlay" />
        <AlertDialog.Content className="modal-wrapper radix-alert-content" role="alertdialog">
          <form onSubmit={(event) => { void submit(event); }} noValidate>
            <div className="modal-header">
              <AlertDialog.Title asChild><h2>Excluir demanda?</h2></AlertDialog.Title>
            </div>
            <div className="modal-body">
              <AlertDialog.Description className="confirm-description">
                A demanda {demanda?.numero} será retirada da carteira, mas continuará preservada na lixeira e no histórico.
              </AlertDialog.Description>
              <div className="form-stack">
                <div>
                  <label htmlFor="delete-demanda-motivo" className="input-label-externa">Motivo da exclusão</label>
                  <textarea
                    id="delete-demanda-motivo"
                    className={`form-control status-comment ${errors.motivo ? 'field-invalid' : ''}`.trim()}
                    placeholder="Descreva por que este registro deve sair da carteira..."
                    {...register('motivo')}
                    aria-invalid={Boolean(errors.motivo)}
                    aria-describedby={errors.motivo ? 'delete-demanda-motivo-error' : undefined}
                  />
                  <FormError id="delete-demanda-motivo-error" message={errors.motivo?.message} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <AlertDialog.Cancel asChild>
                <button type="button" className="btn" onClick={close} disabled={isSubmitting}>Cancelar</button>
              </AlertDialog.Cancel>
              <button type="submit" className="btn btn-danger" disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? 'Excluindo…' : 'Excluir da carteira'}
              </button>
            </div>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
