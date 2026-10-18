import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GoogleSignInButtonDirective } from '../../directives/google-sign-in-button.directive';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, GoogleSignInButtonDirective],
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  readonly stats = [
    { value: '9', label: 'course books' },
    { value: '195', label: 'chapters' },
    { value: '79', label: 'grammar units' },
    { value: 'B1 · B2', label: 'Staatsexamen 2023–2025' },
  ];

  readonly features = [
    {
      icon: '📚',
      title: 'Study Book',
      text: 'Read the chapters of Nederlands in gang, the Delftse methode (A1, A2), Teach Yourself Dutch, short stories, Twee duifjes and a 79-unit grammar course. Every chapter has its word list with English and exercises you can play.',
      path: '/study-book',
      cta: 'Open the books',
    },
    {
      icon: '📝',
      title: 'Exams',
      text: 'Staatsexamen NT2 B1 and B2 papers from 2023 to 2025 with the official answer keys and audio, plus Inburgering A2. Exam mode runs the official timer, free mode lets you check each section, and review shows every answer.',
      path: '/exams',
      cta: 'Try an exam',
    },
    {
      icon: '✍️',
      title: 'Writing feedback',
      text: 'Write your Schrijven answer and get a score on the official criteria, corrections, an improved version of your text and links to the grammar units worth another look.',
      path: '/exams',
      cta: 'Practise writing',
    },
    {
      icon: '🔊',
      title: 'Listening',
      text: 'Press the speaker next to a word or a sentence and hear it read by a Dutch voice, so you learn how it sounds, not just how it looks.',
      path: '/study-book',
      cta: 'Hear a chapter',
    },
    {
      icon: '🃏',
      title: 'Vocab Game',
      text: 'Pull the words from a book chapter and study them as a table or as flashcards.',
      path: '/vocab-game',
      cta: 'Play with words',
    },
    {
      icon: '🎯',
      title: 'Practice',
      text: 'Generate an AI quiz for your level, difficulty and book, and check your answers as you go.',
      path: '/quiz',
      cta: 'Start a quiz',
    },
    {
      icon: '💬',
      title: 'Chat',
      text: 'Ask anything about Dutch: a grammar rule, a word you keep forgetting, a sentence that does not make sense.',
      path: '/chat',
      cta: 'Ask a question',
    },
    {
      icon: '🔎',
      title: 'Translation',
      text: 'Look up a word and get its forms and example sentences, or translate a whole sentence.',
      path: '/translation',
      cta: 'Look up a word',
    },
  ];

  readonly selectionActions = [
    { label: 'Translate', color: '#E8930C' },
    { label: 'Explain', color: '#2F9E44' },
    { label: 'Ask ChatGPT or Claude', color: '#3A64B3' },
    { label: 'Listen', color: '#7048E8' },
    { label: 'Save to Notion', color: '#D6337F' },
  ];

  readonly steps = [
    { title: 'Read', text: 'Open a chapter or an exam text.' },
    { title: 'Select', text: 'Highlight a word or a sentence.' },
    { title: 'Listen, translate, ask', text: 'Hear it, understand it, ask about it.' },
    { title: 'Practise', text: 'Exercises, flashcards and quizzes.' },
    { title: 'Take the exam', text: 'Timed, with the official keys.' },
  ];

  constructor(public authService: AuthService) {}
}
