import { Component } from '@angular/core';
import { TtsService } from '../../services/tts.service';

// Top-right popup while the Dutch voice reads; ✕ stops it.
@Component({
  selector: 'app-now-speaking',
  standalone: true,
  template: `@if (tts.speaking(); as text) {
    <div role="status" aria-live="polite"
      class="fixed right-4 top-20 z-50 flex w-[22rem] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-control border border-line border-l-4 border-l-primary-500 bg-white px-4 py-3 shadow-pop">
      <span class="mt-0.5 animate-pulse text-primary-600" aria-hidden="true">🔊</span>
      <div class="min-w-0 flex-1">
        <h4 class="text-sm font-semibold text-ink">Reading aloud</h4>
        <p class="mt-0.5 line-clamp-2 text-sm text-ink-muted">{{ text }}</p>
      </div>
      <button type="button" (click)="tts.stop()" title="Stop" aria-label="Stop reading"
        class="-mr-1 flex size-7 shrink-0 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-canvas hover:text-ink">✕</button>
    </div>
  }`,
})
export class NowSpeakingComponent {
  constructor(public tts: TtsService) {}
}
