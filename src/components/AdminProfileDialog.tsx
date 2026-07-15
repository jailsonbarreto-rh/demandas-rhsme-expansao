import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PerfilUsuario } from '../types';
import { profileAccessSchema, type ProfileAccessValues } from '../validation/profileSchemas';
import { AppDialog } from './ui/AppDialog';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { FormError } from './ui/FormError';

interface AdminProfileDialogProps {
  perfil: PerfilUsuario | null;
  onClose: () => void;
  onSave: (id: string, values: ProfileAccessValues) => Promise<void> | void;
}

export function AdminProfileDialog({ perfil, onClose, onSave }: AdminProfileDialogProps) {
  const [confirmClose, setConfirmClose] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileAccessValues>({
    resolver: zodResolver(profileAccessSchema),
    defaultValues: {
      nivel: perfil?.nivel ?? 'leitor',
      status: perfil?.status ?? 'pendente',
      setor: perfil?.setor ?? '',
    },
  });

  useEffect(() => {
    if (!perfil) return;
    reset({ nivel: perfil.nivel, status: perfil.status, setor: perfil.setor });
  }, [perfil, reset]);

  if (!perfil) return null;

  const requestClose = () => {
    if (isDirty && !isSubmitting) setConfirmClose(true);
    else onClose();
  };

  const submit = handleSubmit(async (values) => {
    await onSave(perfil.id, values);
    onClose();
  });

  return (
    <>
      <AppDialog
        title="Gerenciar acesso"
        description={`${perfil.nome || perfil.email} • ${perfil.email}`}
        onClose={requestClose}
        contentClassName="admin-profile-dialog"
      >
        <form onSubmit={(event) => { void submit(event); }} noValidate>
          <div className="modal-body">
            <div className="form-grid-modal">
              <div className="input-container-floating col-full">
                <select
                  id="perfil-nivel"
                  {...register('nivel')}
                  aria-invalid={Boolean(errors.nivel)}
                  aria-describedby={errors.nivel ? 'perfil-nivel-error' : undefined}
                >
                  <option value="administrador">Administrador</option>
                  <option value="editor">Editor</option>
                  <option value="leitor">Leitor</option>
                </select>
                <label htmlFor="perfil-nivel">Nível de acesso</label>
                <FormError id="perfil-nivel-error" message={errors.nivel?.message} />
              </div>

              <div className="input-container-floating col-full">
                <select
                  id="perfil-status"
                  {...register('status')}
                  aria-invalid={Boolean(errors.status)}
                  aria-describedby={errors.status ? 'perfil-status-error' : undefined}
                >
                  <option value="ativo">Ativo</option>
                  <option value="pendente">Pendente</option>
                  <option value="inativo">Inativo</option>
                </select>
                <label htmlFor="perfil-status">Status do acesso</label>
                <FormError id="perfil-status-error" message={errors.status?.message} />
              </div>

              <div className="input-container-floating col-full">
                <input
                  id="perfil-setor"
                  type="text"
                  placeholder=" "
                  {...register('setor')}
                  className={errors.setor ? 'field-invalid' : ''}
                  aria-invalid={Boolean(errors.setor)}
                  aria-describedby={errors.setor ? 'perfil-setor-error' : undefined}
                />
                <label htmlFor="perfil-setor">Setor</label>
                <FormError id="perfil-setor-error" message={errors.setor?.message} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} aria-busy={isSubmitting}>
              <i className={`fa-solid ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`} aria-hidden="true" />
              {isSubmitting ? 'Salvando…' : 'Salvar acesso'}
            </button>
            <button type="button" className="btn" onClick={requestClose} disabled={isSubmitting}>
              Cancelar
            </button>
          </div>
        </form>
      </AppDialog>

      <ConfirmDialog
        open={confirmClose}
        title="Descartar alterações?"
        description="As alterações do perfil ainda não foram salvas."
        confirmLabel="Descartar alterações"
        onConfirm={onClose}
        onOpenChange={setConfirmClose}
      />
    </>
  );
}
