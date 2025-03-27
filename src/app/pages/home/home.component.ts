import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { first } from 'rxjs';

@Component({
    selector: 'app-home',
    imports: [CommonModule, FormsModule, MarkdownModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent {
  prompt = '';
  answer = signal(
    "I have retrieved five vocabulary entries that relate to simple questions you might use in Dutch, mainly focusing on nouns. Here's a table with common question prompts: | Dutch Question | English Translation | |----------------|-----------------------------| | Hoe heet je? | What is your name? | | Waar woon je? | Where do you live? | | Wat is je leeftijd? | What is your age? | | Wat is je geboortedatum? | What is your birth date? | | Heb je een mobiel nummer? | Do you have a mobile number? | These questions incorporate some of the vocabulary and provide a foundational way to ask for basic personal information in Dutch."
  );

  constructor(private apiService: ApiService) {}
  askQuestion() {
    this.apiService
      .chat(this.prompt)
      .pipe(first())
      .subscribe((response) => {
        this.answer.set(response);
      });
  }
}
