import { Component, computed, input } from '@angular/core';
import { GrammarTopic } from '../../models/contentModels';
import { toGrammarBlocks } from './content-format';

@Component({
  selector: 'app-grammar-topic',
  standalone: true,
  templateUrl: './grammar-topic.component.html',
})
export class GrammarTopicComponent {
  topic = input.required<GrammarTopic>();
  blocks = computed(() => toGrammarBlocks(this.topic().content));
}
