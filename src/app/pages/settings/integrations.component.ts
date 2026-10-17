import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { first } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { UserSettings } from '../../models/userModels';

interface Integration {
  name: string;
  description: string;
  path: string; // relative to /settings/integrations
  mark: string; // shown in the icon tile
  isConnected: (settings: UserSettings) => boolean; // true when the user has their own credentials
}

const INTEGRATIONS: Integration[] = [
  {
    name: 'Notion',
    description: 'Save words from a text selection to your Notion databases.',
    path: 'notion',
    mark: 'N',
    isConnected: (settings) => settings.notion.secret_set,
  },
];

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './integrations.component.html',
})
export class IntegrationsComponent {
  readonly integrations = INTEGRATIONS;
  settings = signal<UserSettings | null>(null);

  constructor(apiService: ApiService) {
    apiService.getSettings().pipe(first()).subscribe((settings) => this.settings.set(settings));
  }
}
