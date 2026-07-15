import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  destructive = false,
  onConfirm,
  onOpenChange,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="modal-overlay radix-overlay" />
        <AlertDialog.Content className="modal-wrapper radix-alert-content" role="alertdialog">
          <div className="modal-header">
            <AlertDialog.Title asChild><h2>{title}</h2></AlertDialog.Title>
          </div>
          <div className="modal-body">
            <AlertDialog.Description className="confirm-description">{description}</AlertDialog.Description>
          </div>
          <div className="modal-footer">
            <AlertDialog.Cancel asChild>
              <button type="button" className="btn">{cancelLabel}</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                className={destructive ? 'btn btn-danger' : 'btn btn-primary'}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
