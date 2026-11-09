import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { environment } from '../../environments/environment';
import { TaskForm } from './task-form';

describe('TaskForm', () => {
  let fixture: ComponentFixture<TaskForm>;
  let http: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(TaskForm);
    fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}/users`).flush([{ id: 1, name: 'Marwa' }]);
  });

  afterEach(() => http.verify());

  it('refuse un titre vide', () => {
    const c = fixture.componentInstance;
    c.submit();
    expect(c.form.invalid).toBe(true);
    http.expectNone(`${environment.apiUrl}/tasks`);
  });

  it('envoie la tâche avec le statut TODO et le responsable', () => {
    const c = fixture.componentInstance;
    c.form.patchValue({ title: 'Nouvelle tâche', assigneeId: 1 });
    c.submit();

    const req = http.expectOne(`${environment.apiUrl}/tasks`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.status).toBe('TODO');
    expect(req.request.body.assigneeId).toBe(1);
    req.flush({ id: 5, title: 'Nouvelle tâche', priority: 'MEDIUM', status: 'TODO' });

    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});