import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { Task } from '../models/task';
import { TaskList } from './task-list';

const tasks: Task[] = [
  { id: 1, title: 'Écrire le rapport', priority: 'HIGH', status: 'TODO', assigneeId: 1, assigneeName: 'Marwa' },
  { id: 2, title: 'Mettre en place la CI', priority: 'LOW', status: 'DONE', assigneeId: 2, assigneeName: 'Binôme' },
  { id: 3, title: 'Écrire les tests', priority: 'MEDIUM', status: 'IN_PROGRESS', assigneeId: 1, assigneeName: 'Marwa' },
];

describe('TaskList : recherche, filtres et tri', () => {
  let c: TaskList;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [TaskList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(TaskList);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/tasks`).flush(tasks);
    c = fixture.componentInstance;
  });

  it('filtre par titre sans tenir compte de la casse', () => {
    c.search.set('ÉCRIRE');
    expect(c.visibleTasks().map((t) => t.id)).toEqual([1, 3]);
  });

  it('combine statut et responsable', () => {
    c.assigneeFilter.set(1);
    c.statusFilter.set('IN_PROGRESS');
    expect(c.visibleTasks().map((t) => t.id)).toEqual([3]);
  });

  it('trie par priorité décroissante', () => {
    c.sort.set({ active: 'priority', direction: 'desc' });
    expect(c.visibleTasks().map((t) => t.id)).toEqual([1, 3, 2]);
  });

  it('réinitialise les filtres', () => {
    c.search.set('x');
    c.priorityFilter.set('LOW');
    c.resetFilters();
    expect(c.hasFilters()).toBe(false);
    expect(c.visibleTasks().length).toBe(3);
  });
});