import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface InfoDialogProps {
  open: boolean;
  title: string;
  description: string;
  actionLabel?: string;
  onOpenChange: (open: boolean) => void;
}

export function InfoDialog({
  open,
  title,
  description,
  actionLabel = 'Entendi',
  onOpenChange,
}: InfoDialogProps) {
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
            <AlertDialog.Action asChild>
              <button type="button" className="btn btn-primary">{actionLabel}</button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
