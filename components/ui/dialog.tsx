"use client";

import React from "react";
import { Modal } from "./modal";
import { Button } from "./button";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  variant?: "default" | "danger";
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "default",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {description && <p className="text-xs text-[var(--foreground-muted)] mb-4">{description}</p>}
      {children}
      {(onConfirm || cancelLabel) && (
        <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          {onConfirm && (
            <Button variant={variant === "danger" ? "danger" : "premium"} size="sm" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
};
