import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage } from './http-error.interceptor';

describe('apiErrorMessage', () => {
  it('uses the backend detail when present', () => {
    const error = new HttpErrorResponse({
      status: 503,
      error: { detail: 'OpenAI provider unavailable.' },
    });
    expect(apiErrorMessage(error)).toBe('OpenAI provider unavailable.');
  });

  it('falls back to a status-based message', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 0 }))).toBe(
      'Cannot reach the server. Check your connection and try again.'
    );
    expect(apiErrorMessage(new HttpErrorResponse({ status: 503 }))).toBe(
      'The AI service is temporarily unavailable. Please try again later.'
    );
  });

  it('handles non-HTTP errors', () => {
    expect(apiErrorMessage(new Error('boom'))).toBe(
      'Something went wrong. Please try again.'
    );
  });
});
