import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ApiService } from '../../services/api.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-translation',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './translation.component.html',
  styleUrl: './translation.component.scss',
})
export class TranslationComponent {
  prompt = '';
  isTextTranslation = false;
  response = signal("");

  constructor(private apiService: ApiService) {}

  translate() {
    if (this.isTextTranslation) {
      this.apiService
        .translateText(this.prompt)
        .pipe(first())
        .subscribe((response) => {
          this.response.set(response);
        });
    } else {
      this.apiService
        .translateWord(this.prompt)
        .pipe(first())
        .subscribe((response) => {
          this.response.set(response);
        });
    }
  }
}
