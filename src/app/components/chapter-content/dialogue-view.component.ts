import { Component, input } from '@angular/core';
import { ContentDialogue } from '../../models/contentModels';

@Component({
  selector: 'app-dialogue-view',
  standalone: true,
  templateUrl: './dialogue-view.component.html',
})
export class DialogueViewComponent {
  dialogue = input.required<ContentDialogue>();
}
