import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from './toast.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      toastService.addError(toErrorMessage(error));
      return throwError(() => error);
    })
  );
};

function toErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Cannot reach the server. Check your connection and try again.';
  }
  if (error.status === 503) {
    return 'The AI service is temporarily unavailable. Please try again later.';
  }
  if (error.status === 504 || error.status === 408) {
    return 'The request took too long. Please try again.';
  }
  if (error.status >= 500) {
    return 'Something went wrong on the server. Please try again.';
  }
  return 'The request could not be completed.';
}
