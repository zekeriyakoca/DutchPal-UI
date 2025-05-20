import { Component, computed, input, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastDto } from '../../models/toastDto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  data = input<ToastDto | null>(null);
  title = computed(() => {
    return this.data()?.type == 'error' ? 'Error happened!' : 'Warning!';
  });

  public isVisible = new BehaviorSubject<boolean>(false);
  private timer: any;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.isVisible.next(true);
    this.setTimerToCloseIn3Secs();
  }

  private setTimerToCloseIn3Secs() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.isVisible.next(false);
    }, 3000);
  }
}
