import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskCreate, TaskPriority, TaskStatus } from '../models/task';
import { User } from '../models/user';
import { TaskApi } from '../services/task-api';

@Component({
  selector: 'app-task-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TaskApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly taskId = Number(this.route.snapshot.paramMap.get('id')) || null;
  private status: TaskStatus = 'TODO';

  readonly priorities: { value: TaskPriority; label: string }[] = [
    { value: 'LOW', label: 'Basse' },
    { value: 'MEDIUM', label: 'Moyenne' },
    { value: 'HIGH', label: 'Haute' },
  ];

  readonly users = signal<User[]>([]);
  readonly usersError = signal(false);
  readonly saving = signal(false);
  readonly error = signal(false);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(120)]],
    description: ['', Validators.maxLength(2000)],
    priority: ['MEDIUM' as TaskPriority],
    dueDate: [''],
    assigneeId: [null as number | null],
  });

  ngOnInit(): void {
    this.api.getUsers().subscribe({
      next: (users) => this.users.set(users),
      error: () => this.usersError.set(true),
    });

    if (this.taskId !== null) {
      this.api.getTask(this.taskId).subscribe({
        next: (t) => {
          this.status = t.status;
          this.form.patchValue({
            title: t.title,
            description: t.description ?? '',
            priority: t.priority,
            dueDate: t.dueDate ?? '',
            assigneeId: t.assigneeId ?? null,
          });
        },
        error: () => this.error.set(true),
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const body: TaskCreate = {
      title: v.title.trim(),
      description: v.description.trim() || undefined,
      priority: v.priority,
      dueDate: v.dueDate || undefined,
      status: this.status,
      assigneeId: v.assigneeId ?? undefined,
    };
    this.saving.set(true);
    this.error.set(false);
    const request = this.taskId === null ? this.api.createTask(body) : this.api.updateTask(this.taskId, body);
    request.subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: () => {
        this.saving.set(false);
        this.error.set(true);
      },
    });
  }
}