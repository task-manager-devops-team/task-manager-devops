import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { TaskApi } from './task-api';

describe('TaskApi (modifier et supprimer)', () => {
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

  it('updateTask appelle PUT /tasks/:id', () => {
    api.updateTask(3, { title: 'T', priority: 'LOW', status: 'TODO' }).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/tasks/3`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('deleteTask appelle DELETE /tasks/:id', () => {
    api.deleteTask(3).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/tasks/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});