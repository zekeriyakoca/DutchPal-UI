import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';
import { Subject } from 'rxjs';
import { HomeComponent } from './home.component';
import { ApiService } from '../../services/api.service';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let askResponse: Subject<string>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    askResponse = new Subject<string>();
    apiService = jasmine.createSpyObj<ApiService>('ApiService', ['ask']);
    apiService.ask.and.callFake(() => askResponse);

    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideMarkdown(),
        { provide: ApiService, useValue: apiService },
      ],
    });
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function pressEnter(shiftKey = false): KeyboardEvent {
    const textarea: HTMLTextAreaElement =
      fixture.nativeElement.querySelector('#question');
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey,
      cancelable: true,
    });
    textarea.dispatchEvent(event);
    return event;
  }

  it('sends the question on Enter', () => {
    component.prompt = 'Wat is gezellig?';
    const event = pressEnter();

    expect(apiService.ask).toHaveBeenCalledOnceWith('Wat is gezellig?');
    expect(event.defaultPrevented).toBeTrue();
  });

  it('keeps the newline on Shift+Enter', () => {
    component.prompt = 'Wat is gezellig?';
    const event = pressEnter(true);

    expect(apiService.ask).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBeFalse();
  });

  it('does not send an empty question', () => {
    component.prompt = '   ';
    pressEnter();

    expect(apiService.ask).not.toHaveBeenCalled();
  });

  it('does not send again while a request is in flight', () => {
    component.prompt = 'Wat is gezellig?';
    pressEnter();
    pressEnter();

    expect(apiService.ask).toHaveBeenCalledTimes(1);
    expect(component.isLoading()).toBeTrue();

    askResponse.next('Cosy!');
    expect(component.isLoading()).toBeFalse();
    expect(component.answer()).toBe('Cosy!');
  });

  it('shows the backend message inline when the request fails', () => {
    component.prompt = 'Wat is gezellig?';
    pressEnter();
    askResponse.error(
      new HttpErrorResponse({
        status: 503,
        error: { detail: 'OpenAI provider unavailable.' },
      })
    );
    fixture.detectChanges();

    const alert: HTMLElement =
      fixture.nativeElement.querySelector('[role="alert"]');
    expect(component.isLoading()).toBeFalse();
    expect(alert.textContent).toContain("Couldn't get an answer.");
    expect(alert.textContent).toContain('OpenAI provider unavailable.');
    expect(alert.textContent).toContain('Try again');
  });

  it('clears the error and retries from the inline Try again button', () => {
    component.prompt = 'Wat is gezellig?';
    pressEnter();
    askResponse.error(new HttpErrorResponse({ status: 0 }));
    fixture.detectChanges();

    askResponse = new Subject<string>();
    const retry: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[role="alert"] button'
    );
    retry.click();
    fixture.detectChanges();

    expect(apiService.ask).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
