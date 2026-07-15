import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface AppDialogProps {
  open?: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
}

export function AppDialog({
  open = true,
  title,
  description,
  onClose,
  children,
  footer,
  contentClassName = '',
}: AppDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay radix-overlay" />
        <Dialog.Content className={`modal-wrapper radix-dialog-content ${contentClassName}`.trim()}>
          <div className="modal-header">
            <div>
              <Dialog.Title asChild><h2>{title}</h2></Dialog.Title>
              {description && <Dialog.Description className="dialog-description">{description}</Dialog.Description>}
            </div>
            <Dialog.Close asChild>
              <button type="button" className="modal-close" aria-label={`Fechar ${title.toLowerCase()}`}>
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          {children}
          {footer}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
