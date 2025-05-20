import { ToastService } from './../../services/toast.service';
import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-selection-options',
  imports: [],
  templateUrl: './selection-options.component.html',
  styleUrl: './selection-options.component.scss'
})
export class SelectionOptionsComponent {
  selectedText = signal('');
  visible = false;
  position = { top: 0, left: 0 };

  constructor(private toastService: ToastService) {}

  show(x: number, y: number) {
    this.position = { top: y, left: x };
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
  explain(){
    this.toastService.addWarning(`translation of ${this.selectedText()}`);
  }

  translate(){
    this.toastService.addWarning(`translation of ${this.selectedText()}`);
  }
}
