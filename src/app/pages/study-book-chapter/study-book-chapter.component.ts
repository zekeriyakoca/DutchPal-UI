import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { first } from 'rxjs';
import { ApiService } from '../../services/api.service';
import {
  ContentChapter,
  GENERATED_ANSWERS_SOURCE,
  VocabularyItem,
} from '../../models/contentModels';
import { StudyBookTabsComponent } from '../../components/study-book-tabs/study-book-tabs.component';
import { DialogueViewComponent } from '../../components/chapter-content/dialogue-view.component';
import { GrammarTopicComponent } from '../../components/chapter-content/grammar-topic.component';
import {
  cultureText,
  exercisePrompts,
  exerciseText,
} from '../../components/chapter-content/content-format';
import { PLAYABLE_EXERCISE_TYPES } from '../../components/chapter-content/exercise-check';
import { PlayableExerciseComponent } from '../../components/chapter-content/playable-exercise.component';

@Component({
  selector: 'app-study-book-chapter',
  standalone: true,
  imports: [
    RouterLink,
    StudyBookTabsComponent,
    DialogueViewComponent,
    GrammarTopicComponent,
    PlayableExerciseComponent,
  ],
  templateUrl: './study-book-chapter.component.html',
})
export class StudyBookChapterComponent {
  private apiService = inject(ApiService);

  readonly generatedAnswers = GENERATED_ANSWERS_SOURCE;
  readonly exercisePrompts = exercisePrompts;
  readonly exerciseText = exerciseText;
  readonly playableTypes = PLAYABLE_EXERCISE_TYPES;
  readonly cultureText = cultureText;

  chapterId = signal<number | null>(null);
  chapter = signal<ContentChapter | null>(null);
  isLoading = signal(true);
  hasError = signal(false);

  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((params) => {
        const id = Number(params.get('id'));
        this.chapterId.set(Number.isInteger(id) && id > 0 ? id : null);
        this.load();
      });
  }

  load() {
    const id = this.chapterId();
    this.chapter.set(null);
    this.hasError.set(false);
    if (id === null) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }
    this.isLoading.set(true);
    this.apiService
      .getContentChapter(id)
      .pipe(first())
      .subscribe({
        next: (chapter) => {
          if (this.chapterId() !== id) return;
          this.chapter.set(chapter);
          this.isLoading.set(false);
        },
        error: () => {
          if (this.chapterId() !== id) return;
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  /** Extra form/lemma info, shown only when it differs from the printed word. */
  vocabularyHint(item: VocabularyItem): string {
    const printed = item.nl.trim().toLowerCase();
    const hints: string[] = [];
    if (item.form && item.form.trim().toLowerCase() !== printed) {
      hints.push(`form: ${item.form}`);
    }
    if (
      item.lemma &&
      item.lemma.trim().toLowerCase() !== printed &&
      item.lemma !== item.form
    ) {
      hints.push(`lemma: ${item.lemma}`);
    }
    return hints.join(' · ');
  }
}
