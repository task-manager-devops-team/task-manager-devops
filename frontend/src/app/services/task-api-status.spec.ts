import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { TaskApi } from './task-api';

describe('TaskApi (statut)', () => {
  let api: TaskApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(TaskApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('updateStatus appelle PATCH /tasks/:id avec le statut', () => {
    api.updateStatus(2, 'DONE').subscribe();
    const req = http.expectOne(`${environment.apiUrl}/tasks/2`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'DONE' });
    req.flush({});
  });
});