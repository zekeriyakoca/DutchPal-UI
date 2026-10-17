import { Component, input } from '@angular/core';
import {
  ContentChapter,
  GENERATED_ANSWERS_SOURCE,
  VocabularyItem,
} from '../../models/contentModels';
import { DialogueViewComponent } from './dialogue-view.component';
import { GrammarTopicComponent } from './grammar-topic.component';
import { PlayableExerciseComponent } from './playable-exercise.component';
import { cultureText, exercisePrompts, exerciseText } from './content-format';
import { PLAYABLE_EXERCISE_TYPES } from './exercise-check';

/** One book chapter: goals, dialogues, vocabulary, grammar, exercises, culture. */
@Component({
  selector: 'app-chapter-view',
  standalone: true,
  imports: [DialogueViewComponent, GrammarTopicComponent, PlayableExerciseComponent],
  templateUrl: './chapter-view.component.html',
})
export class ChapterViewComponent {
  chapter = input.required<ContentChapter>();

  readonly generatedAnswers = GENERATED_ANSWERS_SOURCE;
  readonly exercisePrompts = exercisePrompts;
  readonly exerciseText = exerciseText;
  readonly playableTypes = PLAYABLE_EXERCISE_TYPES;
  readonly cultureText = cultureText;

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
