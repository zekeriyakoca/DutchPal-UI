import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-dialog',
  standalone: true,
  templateUrl: './dialog.component.html',
})
export class DialogComponent {
  readonly dialog = inject(DialogService);
  private readonly element = viewChild.required<ElementRef<HTMLDialogElement>>('el');

  constructor() {
    effect(() => {
      const el = this.element().nativeElement;
      if (this.dialog.current() && !el.open) el.showModal();
      if (!this.dialog.current() && el.open) el.close();
    });
  }
}
