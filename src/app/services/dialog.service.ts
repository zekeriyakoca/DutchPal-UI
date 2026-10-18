import { Injectable, signal } from '@angular/core';

export interface DialogState {
  kind: 'error' | 'confirm';
  title: string;
  message: string;
  confirmLabel: string;
  /** Error dialogs: shows a "Try again" button that calls it. */
  retry?: () => void;
  resolve?: (confirmed: boolean) => void;
}

/** One app-wide modal for errors and confirmations (rendered by app-dialog). */
@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly current = signal<DialogState | null>(null);

  error(title: string, message: string, retry?: () => void) {
    this.current.set({ kind: 'error', title, message, confirmLabel: 'Try again', retry });
  }

  confirm(title: string, message: string, confirmLabel = 'OK'): Promise<boolean> {
    return new Promise((resolve) =>
      this.current.set({ kind: 'confirm', title, message, confirmLabel, resolve })
    );
  }

  close(confirmed = false) {
    const state = this.current();
    this.current.set(null);
    state?.resolve?.(confirmed);
    if (confirmed) state?.retry?.();
  }
}
