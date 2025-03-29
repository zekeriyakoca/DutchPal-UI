import { CommonModule } from '@angular/common';
import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { first } from 'rxjs';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent {
  prompt = '';
  answer = signal('');

  constructor(private apiService: ApiService) {}
  askQuestion() {
    this.apiService
      .ask(this.prompt)
      .pipe(first())
      .subscribe((response) => {
        this.answer.set(response);
      });
  }
}
