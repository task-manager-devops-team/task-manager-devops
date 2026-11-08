import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { Task } from '../models/task';
import { TaskApi } from './task-api';

describe('TaskApi', () => {
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

  it('getTasks appelle GET /tasks et renvoie la liste', () => {
    const tasks: Task[] = [
      { id: 1, title: 'Tache 1', priority: 'HIGH', status: 'TODO' },
      { id: 2, title: 'Tache 2', priority: 'LOW', status: 'DONE' },
    ];
    let result: Task[] | undefined;

    api.getTasks().subscribe((t) => (result = t));

    const req = http.expectOne(`${environment.apiUrl}/tasks`);
    expect(req.request.method).toBe('GET');
    req.flush(tasks);

    expect(result).toEqual(tasks);
  });

  it('getHealth appelle GET /health', () => {
    api.getHealth().subscribe();

    const req = http.expectOne(`${environment.apiUrl}/health`);
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'ok' });
  });
});