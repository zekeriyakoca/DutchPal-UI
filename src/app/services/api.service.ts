import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/apiResponse';
import {
  ChatRequest,
  VocabRequest,
  TranslateRequest,
  SentencesRequest,
  QuizRequest,
} from '../models/apiRequestModels';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private _httpClient: HttpClient) {}

  ask(prompt: string): Observable<string> {
    const body: ChatRequest = { message: prompt };
    return this._httpClient
      .post<ApiResponse>(`${environment.apiUrl}/chat`, body)
      .pipe(map((response) => response.response));
  }

  translateWord(word: string): Observable<string> {
    const body: VocabRequest = {
      message: word,
      number_of_entries: 1,
    };
    return this._httpClient
      .post<ApiResponse>(`${environment.apiUrl}/vocabulary`, body)
      .pipe(map((response) => response.response));
  }

  translateText(text: string): Observable<string> {
    const body: TranslateRequest = {
      message: text,
    };
    return this._httpClient
      .post<ApiResponse>(`${environment.apiUrl}/translate`, body)
      .pipe(map((response) => response.response));
  }

  getVocabulary(
    level: string,
    numberOfEntries: number,
    bookId: number,
    wordType: string
  ): Observable<string> {
    const body: VocabRequest = {
      message: '',
      level,
      number_of_entries: numberOfEntries,
      book_id: bookId,
      word_type: wordType,
    };
    return this._httpClient
      .post<ApiResponse>(`${environment.apiUrl}/vocabulary`, body)
      .pipe(map((response) => response.response));
  }

  getSentences(
    level: string,
    numberOfEntries: number,
    bookId: number
  ): Observable<string> {
    const body: SentencesRequest = {
      level,
      number_of_entries: numberOfEntries,
      book_id: bookId,
    };
    return this._httpClient
      .post<ApiResponse>(`${environment.apiUrl}/sentences`, body)
      .pipe(map((response) => response.response));
  }

  generateQuiz(
    cefr: string,
    difficulty: number,
    numberOfEntries: number,
    bookId: number,
    selectedQuizType: QuizRequest['quiz_type']
  ): Observable<string> {
    const body: QuizRequest = {
      message: '',
      level: cefr,
      difficulty,
      number_of_entries: numberOfEntries,
      book_id: bookId,
      quiz_type: selectedQuizType,
    };
    return this._httpClient
      .post<ApiResponse>(`${environment.apiUrl}/quiz`, body)
      .pipe(map((response) => response.response));
  }
}
