import { first, of } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { ToastService } from './../../services/toast.service';
import { Component, input, signal, computed } from '@angular/core';
import { filter, switchMap } from 'rxjs/operators';
import { WordTranslation } from '../../models/apiResponse';
import { NotionNounDto, NotionVerbDto } from '../../models/notionModels';

@Component({
  selector: 'app-selection-options',
  imports: [],
  templateUrl: './selection-options.component.html',
  styleUrl: './selection-options.component.scss',
})
export class SelectionOptionsComponent {
  selectedText = signal('');
  visible = false;
  position = { top: 0, left: 0 };

  constructor(
    private toastService: ToastService,
    private apiService: ApiService
  ) {}

  show(x: number, y: number) {
    this.position = { top: y, left: x };
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  // computed
  isSelectionWord: ReturnType<typeof computed> = computed(() => {
    const text = this.selectedText();
    return text.length > 0 && text.split(' ').length <= 2;
  });

  talkAbout() {
    window.open(
      'https://chat.openai.com/?q=' + encodeURIComponent(this.generatePrompt()),
      '_blank'
    );
  }

  generatePrompt(): string {
    const text = this.selectedText();
    return `I'm learning Dutch. Please explain the general structure of this text along with the translation in English: "${text}". Only highlight noteworthy grammar or vocabulary — skip unnecessary details`;
  }

  explain() {
    this.apiService
      .explain(this.selectedText())
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.toastService.addPermanentToast(response);
        },
        error: (error) => {
          console.error('Unable to fetch explanation:', error);
          this.toastService.addError('Unable to fetch explanation');
        },
      });
  }

  translate() {
    const requestSubscription =
      this.selectedText().split(' ').length <= 1
        ? this.apiService.translateWordSimple(this.selectedText())
        : this.apiService.translateText(this.selectedText());

    requestSubscription.pipe(first()).subscribe({
      next: (response) => {
        this.toastService.addPermanentToast(response);
      },
      error: (error) => {
        console.error('Unable to fetch translation:', error);
        this.toastService.addError('Unable to fetch translation');
      },
    });
  }

  addToNotion() {
    this.apiService
      .translateWordAsJson(this.selectedText())
      .pipe(
        first(),
        switchMap((word: WordTranslation) => {
          if (
            word.type === 'NOUN' ||
            word.type === 'ADJECTIVE' ||
            word.type === 'ADVERB'
          ) {
            return this.apiService.addNounToNotion({
              name: word.word,
              meaning: word.translation,
              pronunciation: '',
              sentence: word.examples.join('\n'),
            } as NotionNounDto);
          } else if (word.type === 'VERB') {
            return this.apiService.addVerbToNotion({
              name: word.word,
              meaning: word.translation,
              sentence: word.examples.join('\n'),
            } as NotionVerbDto);
          }
          return of(undefined);
        })
      )
      .subscribe({
        next: () => {
          this.toastService.addInfo(`'${this.selectedText()}' added to Notion`);
        },
        error: (error) => {
          console.error(
            `Unable to add '${this.selectedText()}' to Notion:`,
            error
          );
          this.toastService.addError(
            `Unable to add '${this.selectedText()}' to Notion`
          );
        },
      });
  }
}
