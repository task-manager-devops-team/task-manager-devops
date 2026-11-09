import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { Task } from '../models/task';
import { Archives } from '../archives/archives';
import { TaskList } from '../task-list/task-list';
import { TaskApi } from './task-api';

const tasks: Task[] = [
  { id: 1, title: 'Active', priority: 'LOW', status: 'TODO' },
  { id: 2, title: 'Archivée', priority: 'HIGH', status: 'DONE', archived: true },
];

describe('US11 : archiver', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('archive appelle PATCH /tasks/:id avec archived', () => {
    TestBed.inject(TaskApi).archive(2, true).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/tasks/2`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ archived: true });
    req.flush({});
  });

  it('la liste masque les tâches archivées', () => {
    const fixture = TestBed.createComponent(TaskList);
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}/tasks`).flush(tasks);
    expect(fixture.componentInstance.visibleTasks().map((t) => t.id)).toEqual([1]);
  });

  it('la page Archives ne garde que les tâches archivées', () => {
    const fixture = TestBed.createComponent(Archives);
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}/tasks`).flush(tasks);
    expect(fixture.componentInstance.tasks().map((t) => t.id)).toEqual([2]);
  });
});