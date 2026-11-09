import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => sessionStorage.clear());

  function create() {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    return fixture;
  }

  it('does not call the API when the form is empty', () => {
    const fixture = create();
    fixture.componentInstance.submit();
    http.expectNone('http://localhost:8080/api/auth/login');
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('toggles password visibility', () => {
    const fixture = create();
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input[formControlName="password"]',
    ) as HTMLInputElement;
    expect(input.type).toBe('password');

    fixture.componentInstance.togglePassword();
    fixture.detectChanges();

    expect(input.type).toBe('text');
  });

  it('redirects to the dashboard after a successful login', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = create();
    fixture.componentInstance.form.setValue({ email: 'a@b.c', password: 'secret' });

    fixture.componentInstance.submit();
    http.expectOne('http://localhost:8080/api/auth/login').flush({ token: 'a.b.c' });

    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('shows a clear message when the credentials are wrong', () => {
    const fixture = create();
    fixture.componentInstance.form.setValue({ email: 'a@b.c', password: 'bad' });

    fixture.componentInstance.submit();
    http
      .expectOne('http://localhost:8080/api/auth/login')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(fixture.componentInstance.errorMessage()).toBe('Email ou mot de passe incorrect.');
    expect((fixture.nativeElement as HTMLElement).querySelector('.form-error')).not.toBeNull();
  });
});