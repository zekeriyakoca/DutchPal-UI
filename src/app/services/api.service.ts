import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AskResponse } from '../models/askResponse';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private _httpClient: HttpClient) {}

  chat(prompt: string): Observable<string> {
    return this._httpClient
      .post<AskResponse>(`${environment.apiUrl}/ask`, {
        message: prompt,
        page: 'chat',
      })
      .pipe(map((response) => response.response));
  }
}
