import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[appSpinUntil]',
  standalone: true,
})
export class SpinUntilDirective implements OnChanges {
  @Input('appSpinUntil') isLoading: boolean = false;
  private spinnerEl: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('isLoading' in changes) {
      this.updateSpinner();
    }
  }

  private updateSpinner() {
    if (this.isLoading) {
      this.addSpinner();
    } else {
      this.removeSpinner();
    }
  }

  private addSpinner() {
    if (this.spinnerEl) return;

    const spinnerWrapper = this.renderer.createElement('div');
    this.renderer.setStyle(spinnerWrapper, 'position', 'absolute');
    this.renderer.setStyle(spinnerWrapper, 'top', '0');
    this.renderer.setStyle(spinnerWrapper, 'left', '0');
    this.renderer.setStyle(spinnerWrapper, 'width', '100%');
    this.renderer.setStyle(spinnerWrapper, 'height', '100%');
    this.renderer.setStyle(spinnerWrapper, 'display', 'flex');
    this.renderer.setStyle(spinnerWrapper, 'alignItems', 'center');
    this.renderer.setStyle(spinnerWrapper, 'justifyContent', 'center');
    this.renderer.setStyle(
      spinnerWrapper,
      'backgroundColor',
      'rgba(255, 255, 255, 0.6)'
    );
    this.renderer.setStyle(spinnerWrapper, 'zIndex', '10');

    const spinner = this.renderer.createElement('div');
    this.renderer.setProperty(
      spinner,
      'innerHTML',
      `
        <svg
          class="animate-spin text-indigo-600"
          style="height: 3rem; width: 3rem;"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" stroke-width="3" />
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    `
    );

    this.renderer.appendChild(spinnerWrapper, spinner);
    this.renderer.appendChild(this.el.nativeElement, spinnerWrapper);
    this.spinnerEl = spinnerWrapper;
  }

  private removeSpinner() {
    if (this.spinnerEl) {
      this.renderer.removeChild(this.el.nativeElement, this.spinnerEl);
      this.spinnerEl = null;
    }
  }
}
