import { first } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { ToastService } from './../../services/toast.service';
import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-selection-options',
  imports: [],
  templateUrl: './selection-options.component.html',
  styleUrl: './selection-options.component.scss',
})
export class SelectionOptionsComponent {
  selectedText = signal('');
  visible = false;
  position = { top: 0, left: 0 };

  constructor(
    private toastService: ToastService,
    private apiService: ApiService
  ) {}

  show(x: number, y: number) {
    this.position = { top: y, left: x };
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
  explain() {
    this.toastService.addWarning(
      `Hang tight! This feature isn't ready yet — but you'll have a chatbot to talk to very soon!`
    );
  }

  translate() {
    const requestSubscription =
      this.selectedText().split(' ').length <= 1
        ? this.apiService.translateWordSimple(this.selectedText())
        : this.apiService.translateText(this.selectedText());

    requestSubscription.pipe(first()).subscribe({
      next: (response) => {
        this.toastService.addPermanentToast(response);
      },
      error: (error) => {
        console.error('Unable to fetch translation:', error);
        this.toastService.addError('Unable to fetch translation');
      },
    });
  }
}
