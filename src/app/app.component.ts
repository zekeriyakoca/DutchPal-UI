import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastDto } from './models/toastDto';
import { concatMap, delay, filter, map, Observable, of } from 'rxjs';
import { ToastService } from './services/toast.service';
import { ToastComponent } from './components/toast/toast.component';
import { PermanentToastComponent } from './components/permanent-toast/permanent-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ToastComponent,
    PermanentToastComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'DutchPal-UI';
  toast$ = new Observable<ToastDto>();
  permanentToast = signal<ToastDto | null>(null);
  lastToastTime = 0;

  constructor(private _toastService: ToastService) {
    this._toastService.permanentToast$
      .pipe(filter((message) => message !== undefined))
      .subscribe((message) => {
        this.permanentToast.set(message);
        // this.permanentToast.set(null);
        // setTimeout(() => {
        //   this.permanentToast.set(message);
        // }, 0);
      });

    this.toast$ = this._toastService.toast$.pipe(
      concatMap((message) => {
        const now = Date.now();
        const elapsed = now - this.lastToastTime;
        const shouldDelay = elapsed < 3400;
        this.lastToastTime = now + (shouldDelay ? 3400 : 0); // Update when the current toast will finish
        return of(message).pipe(delay(shouldDelay ? 3400 : 0));
      }),
      filter((message) => message !== undefined)
    );
  }
}
