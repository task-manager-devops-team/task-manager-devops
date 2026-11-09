import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { Task } from '../models/task';
import { TaskList } from './task-list';

describe('TaskList', () => {
  let fixture: ComponentFixture<TaskList>;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/tasks`;

  const tasks: Task[] = [
    { id: 1, title: 'Premiere tache', priority: 'HIGH', dueDate: '2026-11-20', status: 'TODO' },
    { id: 2, title: 'Deuxieme tache', priority: 'LOW', status: 'DONE' },
  ];

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskList);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('affiche le chargement pendant la requete', () => {
    fixture.detectChanges();

    expect(text()).toContain('Chargement');
    http.expectOne(url);
  });

  it('affiche les taches recues', async () => {
    fixture.detectChanges();
    http.expectOne(url).flush(tasks);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(text()).toContain('Premiere tache');
    expect(text()).toContain('Deuxieme tache');
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('affiche "Aucune tache" quand la liste est vide', async () => {
    fixture.detectChanges();
    http.expectOne(url).flush([]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(text()).toContain('Aucune');
  });

  it('affiche un message d\'erreur si l\'API echoue', async () => {
    fixture.detectChanges();
    http.expectOne(url).flush('erreur', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(text()).toContain('Impossible de charger');
  });
});