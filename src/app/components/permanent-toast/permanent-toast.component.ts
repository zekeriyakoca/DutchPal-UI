import {
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  SimpleChanges,
} from '@angular/core';
import { BehaviorSubject, delay } from 'rxjs';
import { ToastDto } from '../../models/toastDto';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-permanent-toast',
  imports: [CommonModule, MarkdownModule],
  templateUrl: './permanent-toast.component.html',
  styleUrl: './permanent-toast.component.scss',
})
export class PermanentToastComponent {
  data = input<ToastDto | null>(null);
  title = input<string>('Notification');

  public isVisible = new BehaviorSubject<boolean>(false);
  private timer: any;

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.isVisible.next(false);
    setTimeout(() => {
      this.isVisible.next(true);
      this.setTimerToCloseIn15Secs();
    }, 0);
  }

  private setTimerToCloseIn15Secs() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.isVisible.next(false);
    }, 300000);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;

    if (!this.elementRef.nativeElement.contains(target)) {
      this.closeToast();
    }
  }

  closeToast() {
    this.isVisible.next(false);
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
