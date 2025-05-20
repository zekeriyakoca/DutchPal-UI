import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastDto } from '../models/toastDto';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  public toast$ = new BehaviorSubject<ToastDto | undefined>(undefined);

  constructor() {}

  public addError(message: string) {
    this.toast$.next({ message: message, type: 'error' });
  }

  // TODO : Implement warning later.
  public addWarning(message: string) {
    this.toast$.next({ message: message, type: 'warning' });
  }
}
