import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AskResponse } from '../models/askResponse';
import { AskRequest } from '../models/askRequest';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private _httpClient: HttpClient) {}

  ask(prompt: string): Observable<string> {
    return this._httpClient
      .post<AskResponse>(`${environment.apiUrl}/ask`, {
        message: prompt,
        page: 'chat',
      })
      .pipe(map((response) => response.response));
  }

  translateWord(word: string): Observable<string> {
    const body = {
      message: word,
      page: 'vocab',
      number_of_entries: 1,
    } as AskRequest;
    return this._httpClient
      .post<AskResponse>(`${environment.apiUrl}/ask`, body)
      .pipe(map((response) => response.response));
  }

  translateText(text: string): Observable<string> {
    const body = {
      message: text,
      page: 'translate-sentence',
      number_of_entries: 1,
    } as AskRequest;
    return this._httpClient
      .post<AskResponse>(`${environment.apiUrl}/ask`, body)
      .pipe(map((response) => response.response));
  }

  getVocabulary(
    level: string,
    numberOfEntries: number,
    bookId: number
  ): Observable<string> {
    const body = {
      message: '',
      page: 'vocab',
      number_of_entries: numberOfEntries,
      level,
      book_id: bookId,
    } as AskRequest;
    return this._httpClient
      .post<AskResponse>(`${environment.apiUrl}/ask`, body)
      .pipe(map((response) => response.response));
  }

  getSentences(
    level: string,
    numberOfEntries: number,
    bookId: number
  ): Observable<string> {
    const body = {
      message: '',
      page: 'sentences',
      number_of_entries: numberOfEntries,
      level,
      book_id: bookId,
    } as AskRequest;
    return this._httpClient
      .post<AskResponse>(`${environment.apiUrl}/ask`, body)
      .pipe(map((response) => response.response));
  }

  generateQuiz(
    cefr: string,
    difficulty: number,
    numberOfEntries: number,
    bookId: number,
    selectedQuizType: string
  ): Observable<string> {
    const body = {
      message: '',
      page: 'quiz',
      number_of_entries: numberOfEntries,
      level: cefr,
      difficulty: difficulty,
      book_id: bookId,
      quiz_type: selectedQuizType,
    } as AskRequest;
    return this._httpClient
      .post<AskResponse>(`${environment.apiUrl}/ask`, body)
      .pipe(map((response) => response.response));
  }
}
