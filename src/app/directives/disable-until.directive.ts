import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[appDisabledUntil]',
  standalone: true,
})
export class DisabledUntilDirective implements OnChanges {
  @Input('appDisabledUntil') isLoading: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('isLoading' in changes) {
      this.updateDisabledState();
    }
  }

  private updateDisabledState() {
    const nativeEl = this.el.nativeElement;

    if (this.isLoading) {
      this.renderer.setAttribute(nativeEl, 'disabled', 'true');
      this.renderer.addClass(nativeEl, 'opacity-50');
      this.renderer.addClass(nativeEl, 'cursor-not-allowed');
    } else {
      this.renderer.removeAttribute(nativeEl, 'disabled');
      this.renderer.removeClass(nativeEl, 'opacity-50');
      this.renderer.removeClass(nativeEl, 'cursor-not-allowed');
    }
  }
}
