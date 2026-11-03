import type { ReactElement, ReactNode, RefObject } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import "./modal.css";

/** Shared presentation only. Radix owns the focus scope, dismissal and scroll lock. */
export function Modal({
  open,
  onOpenChange,
  trigger,
  title,
  titleId,
  description,
  initialFocusRef,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactElement;
  title: string;
  titleId: string;
  description: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="hh-modal-overlay" />
        <Dialog.Content
          className="hh-modal-content manuscript"
          role="dialog"
          aria-labelledby={titleId}
          onOpenAutoFocus={(event) => {
            if (initialFocusRef?.current) {
              event.preventDefault();
              initialFocusRef.current.focus();
            }
          }}
          onKeyDown={(event) => {
            // A number typed in a dialog must not select a scene choice below it.
            if (/^[0-9]$/.test(event.key)) event.stopPropagation();
          }}
        >
          <p className="hh-modal-eyebrow" aria-hidden="true">
            洪荒纪 · 此生一卷
          </p>
          <Dialog.Title id={titleId} className="hh-modal-title">
            {title}
          </Dialog.Title>
          <Dialog.Description className="hh-modal-description">{description}</Dialog.Description>
          <Dialog.Close asChild>
            <button type="button" className="hh-modal-close" aria-label="关闭对话框">
              <span aria-hidden="true">×</span>
            </button>
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
