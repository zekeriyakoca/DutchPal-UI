import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, WordTranslation } from '../models/apiResponse';
import {
  ChatRequest,
  VocabRequest,
  TranslateRequest,
  SentencesRequest,
  QuizRequest,
  TranslateWordSimpleRequest,
} from '../models/apiRequestModels';
import { BootstrapData, Option } from '../models/bootstrap';
import { SentenceDto, SectionDto } from '../models/sectionModels';
import { NotionVerbDto, NotionNounDto } from '../models/notionModels';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private _httpClient: HttpClient) {}

  getBootstrapData(): Observable<BootstrapData> {
    return this._httpClient
      .get<BootstrapData>(`${environment.apiUrl}/bootstrap`)
      .pipe(
        shareReplay(1) // Cache the value and share it with all subscribers
      );
  }

  ask(prompt: string): Observable<string> {
    const body: ChatRequest = { message: prompt };
    return this._httpClient
      .post<ApiResponse<string>>(`${environment.apiUrl}/chat`, body)
      .pipe(map((response) => response.response));
  }

  translateWord(word: string): Observable<string> {
    const body: VocabRequest = {
      message: word,
      number_of_entries: 1,
    };
    return this._httpClient
      .post<ApiResponse<string>>(`${environment.apiUrl}/vocabulary`, body)
      .pipe(map((response) => response.response));
  }

  translateWordSimple(word: string): Observable<string> {
    const body: TranslateWordSimpleRequest = {
      message: word,
    };
    return this._httpClient
      .post<ApiResponse<string>>(`${environment.apiUrl}/translate-word`, body)
      .pipe(map((response) => response.response));
  }

  translateWordAsJson(word: string): Observable<WordTranslation> {
    const body: TranslateWordSimpleRequest = {
      message: word,
    };
    return this._httpClient
      .post<ApiResponse<WordTranslation>>(
        `${environment.apiUrl}/translate-word-as-json`,
        body
      )
      .pipe(map((response) => response.response));
  }

  translateText(text: string): Observable<string> {
    const body: TranslateRequest = {
      message: text,
    };
    return this._httpClient
      .post<ApiResponse<string>>(`${environment.apiUrl}/translate`, body)
      .pipe(map((response) => response.response));
  }

  explain(text: string): Observable<string> {
    const body: TranslateRequest = {
      message: text,
    };
    return this._httpClient
      .post<ApiResponse<string>>(`${environment.apiUrl}/explain`, body)
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
      .post<ApiResponse<string>>(`${environment.apiUrl}/vocabulary`, body)
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
      .post<ApiResponse<string>>(`${environment.apiUrl}/sentences`, body)
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
      .post<ApiResponse<string>>(`${environment.apiUrl}/quiz`, body)
      .pipe(map((response) => response.response));
  }

  getSectionNamesOfBook(bookId: number): Observable<Option[]> {
    return this._httpClient
      .get<Option[]>(`${environment.apiV2Url}/books/${bookId}/section-options`)
      .pipe(
        shareReplay(1) // Cache the value and share it with all subscribers
      );
  }

  getSectionSectences(
    bookId: number,
    sectionId: number
  ): Observable<SentenceDto[]> {
    return this._httpClient
      .get<SentenceDto[]>(
        `${environment.apiV2Url}/books/${bookId}/sections/${sectionId}/sentences`
      )
      .pipe(
        shareReplay(1) // Cache the value and share it with all subscribers
      );
  }

  addNounToNotion(body: NotionNounDto): Observable<object> {
    return this._httpClient
      .post<object>(
        `${environment.apiV2Url}/vocabulary/noun/upsert-to-notion`,
        body
      )
      .pipe(
        shareReplay(1) // Cache the value and share it with all subscribers
      );
  }

  addVerbToNotion(body: NotionVerbDto): Observable<object> {
    return this._httpClient
      .post<object>(
        `${environment.apiV2Url}/vocabulary/verb/upsert-to-notion`,
        body
      )
      .pipe(
        shareReplay(1) // Cache the value and share it with all subscribers
      );
  }
}
