import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthApi } from './auth-api';

function fakeToken(expSecondsFromNow: number): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=/g, '');
  const exp = Math.floor(Date.now() / 1000) + expSecondsFromNow;
  return `${b64({ alg: 'HS256' })}.${b64({ exp })}.sig`;
}

describe('AuthApi', () => {
  let api: AuthApi;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(AuthApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('stores the token after a successful login', () => {
    const token = fakeToken(3600);
    api.login({ email: 'a@b.c', password: 'x' }).subscribe();

    const req = http.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ token });

    expect(api.token()).toBe(token);
    expect(api.isAuthenticated()).toBe(true);
  });

  it('is not authenticated when the token is expired', () => {
    sessionStorage.setItem('taskflow_token', fakeToken(-10));
    const fresh = TestBed.runInInjectionContext(() => new AuthApi());
    expect(fresh.isAuthenticated()).toBe(false);
  });

  it('clears the session on logout', () => {
    api.login({ email: 'a@b.c', password: 'x' }).subscribe();
    http.expectOne('http://localhost:8080/api/auth/login').flush({ token: fakeToken(3600) });

    api.logout();

    expect(api.token()).toBeNull();
    expect(api.isAuthenticated()).toBe(false);
  });

  it('clears the session even if the server logout fails', () => {
    api.login({ email: 'a@b.c', password: 'x' }).subscribe();
    http.expectOne('http://localhost:8080/api/auth/login').flush({ token: fakeToken(3600) });

    api.logoutRemote().subscribe();
    http
      .expectOne('http://localhost:8080/api/auth/logout')
      .flush('error', { status: 500, statusText: 'Server Error' });

    expect(api.token()).toBeNull();
  });

  it('sends the registration to the API', () => {
    api.register({ name: 'N', email: 'a@b.c', password: 'password1' }).subscribe();
    const req = http.expectOne('http://localhost:8080/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'N', email: 'a@b.c', password: 'password1' });
    req.flush(null, { status: 201, statusText: 'Created' });
  });
});