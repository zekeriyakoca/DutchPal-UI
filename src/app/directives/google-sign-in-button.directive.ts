import { AfterViewInit, Directive, ElementRef } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Renders Google's own "Sign in with Google" button into the host element.
@Directive({
  selector: '[appGoogleSignInButton]',
  standalone: true,
})
export class GoogleSignInButtonDirective implements AfterViewInit {
  constructor(private el: ElementRef<HTMLElement>, private authService: AuthService) {}

  ngAfterViewInit() {
    this.authService.renderSignInButton(this.el.nativeElement);
  }
}
