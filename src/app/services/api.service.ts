import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { pageHandlesErrors } from './http-error.interceptor';
import {
  ApiResponse,
  QuizResponse,
  VocabItem,
  WordLookup,
  WordTranslation,
} from '../models/apiResponse';
import {
  ChatRequest,
  ChatTurn,
  VocabRequest,
  TranslateRequest,
  QuizRequest,
  TranslateWordSimpleRequest,
  WordLookupRequest,
} from '../models/apiRequestModels';
import { BootstrapData } from '../models/bootstrap';
import { NotionVerbDto, NotionNounDto } from '../models/notionModels';
import {
  ContentBook,
  ChapterSummary,
  Chapter,
} from '../models/contentModels';
import {
  AuthState,
  NotionSettingsRequest,
  User,
  UserSettings,
} from '../models/userModels';

// Sends the session cookie. Production is same-origin anyway; this covers the local dev API.
const withSession = { withCredentials: true };

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

  ask(prompt: string, history: ChatTurn[]): Observable<string> {
    const body: ChatRequest = { message: prompt, history };
    return this._httpClient
      .post<ApiResponse<string>>(`${environment.apiUrl}/chat`, body, { context: pageHandlesErrors() })
      .pipe(map((response) => response.response));
  }

  lookupWord(word: string): Observable<WordLookup> {
    const body: WordLookupRequest = { word };
    return this._httpClient.post<WordLookup>(
      `${environment.apiUrl}/word/lookup`,
      body,
      { context: pageHandlesErrors() }
    );
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
      .post<ApiResponse<string>>(`${environment.apiUrl}/translate`, body, { context: pageHandlesErrors() })
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
    bookId: string,
    wordType: string
  ): Observable<VocabItem[]> {
    const body: VocabRequest = {
      message: '',
      level,
      number_of_entries: numberOfEntries,
      book_id: bookId,
      word_type: wordType,
    };
    return this._httpClient
      .post<{ items: VocabItem[] }>(`${environment.apiUrl}/vocabulary`, body)
      .pipe(map((response) => response.items));
  }

  generateQuiz(
    cefr: string,
    difficulty: number,
    numberOfEntries: number,
    bookId: string,
    selectedQuizType: QuizRequest['quiz_type']
  ): Observable<QuizResponse> {
    const body: QuizRequest = {
      message: '',
      level: cefr,
      difficulty,
      number_of_entries: numberOfEntries,
      book_id: bookId,
      quiz_type: selectedQuizType,
    };
    return this._httpClient.post<QuizResponse>(
      `${environment.apiUrl}/quiz`,
      body
    );
  }

  getContentBooks(): Observable<ContentBook[]> {
    return this._httpClient.get<ContentBook[]>(
      `${environment.apiUrl}/content/books`
    );
  }

  getContentChapters(bookId: string): Observable<ChapterSummary[]> {
    return this._httpClient.get<ChapterSummary[]>(
      `${environment.apiUrl}/content/books/${bookId}/chapters`
    );
  }

  getContentChapter(chapterId: number): Observable<Chapter> {
    return this._httpClient.get<Chapter>(
      `${environment.apiUrl}/content/chapters/${chapterId}`
    );
  }

  addNounToNotion(body: NotionNounDto): Observable<boolean> {
    return this._httpClient
      .post<object>(`${environment.apiUrl}/notion/noun`, body, withSession)
      .pipe(
        map((data: any) => {
          return data.count > 0;
        })
      );
  }

  addVerbToNotion(body: NotionVerbDto): Observable<boolean> {
    return this._httpClient
      .post<object>(`${environment.apiUrl}/notion/verb`, body, withSession)
      .pipe(
        map((data: any) => {
          return data.count > 0;
        })
      );
  }

  getMe(): Observable<AuthState> {
    return this._httpClient.get<AuthState>(
      `${environment.apiUrl}/auth/me`,
      withSession
    );
  }

  signInWithGoogle(credential: string): Observable<User> {
    return this._httpClient.post<User>(
      `${environment.apiUrl}/auth/google`,
      { credential },
      withSession
    );
  }

  signOut(): Observable<unknown> {
    return this._httpClient.post(
      `${environment.apiUrl}/auth/logout`,
      {},
      withSession
    );
  }

  getSettings(): Observable<UserSettings> {
    return this._httpClient.get<UserSettings>(
      `${environment.apiUrl}/settings`,
      withSession
    );
  }

  saveNotionSettings(body: NotionSettingsRequest): Observable<UserSettings> {
    return this._httpClient.put<UserSettings>(
      `${environment.apiUrl}/settings/notion`,
      body,
      { ...withSession, context: pageHandlesErrors() }
    );
  }

  useDefaultNotion(): Observable<UserSettings> {
    return this._httpClient.delete<UserSettings>(
      `${environment.apiUrl}/settings/notion`,
      { ...withSession, context: pageHandlesErrors() }
    );
  }

  // Titles of the saved Notion databases, keyed by 'noun' / 'verb'
  testNotion(): Observable<Record<string, string>> {
    return this._httpClient.post<Record<string, string>>(
      `${environment.apiUrl}/settings/notion/test`,
      {},
      { ...withSession, context: pageHandlesErrors() }
    );
  }

  // Dutch speech as MP3 (cached by the server). Errors are handled by TtsService, which falls back to the browser voice.
  textToSpeech(text: string): Observable<Blob> {
    return this._httpClient.get(`${environment.apiUrl}/tts`, {
      ...withSession,
      params: { text },
      responseType: 'blob',
      context: pageHandlesErrors(),
    });
  }
}
