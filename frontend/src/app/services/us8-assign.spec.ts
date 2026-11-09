import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { AuthApi } from './auth-api';
import { TaskApi } from './task-api';

const tokenWith = (role: string) => `x.${btoa(JSON.stringify({ role }))}.y`;

describe('US8 : rôle et assignation', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('isProjectManager est vrai pour le rôle CHEF_PROJET', () => {
    const auth = TestBed.inject(AuthApi);
    auth.token.set(tokenWith('CHEF_PROJET'));
    expect(auth.isProjectManager()).toBe(true);
  });

  it('isProjectManager est faux pour un membre', () => {
    const auth = TestBed.inject(AuthApi);
    auth.token.set(tokenWith('MEMBRE'));
    expect(auth.isProjectManager()).toBe(false);
  });

  it('assign appelle PATCH /tasks/:id avec assigneeId', () => {
    TestBed.inject(TaskApi).assign(4, 2).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/tasks/4`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ assigneeId: 2 });
    req.flush({});
  });
});