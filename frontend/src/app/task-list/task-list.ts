import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { Task, TaskPriority, TaskStatus } from '../models/task';
import { AuthApi } from '../services/auth-api';
import { TaskApi } from '../services/task-api';
import { AssignDialog } from './assign-dialog';
import { DeleteDialog } from './delete-dialog';

@Component({
  selector: 'app-task-list',
  imports: [
    DatePipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  private readonly api = inject(TaskApi);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthApi);

  readonly isManager = this.auth.isProjectManager;
  readonly forbidden = signal(false);

  readonly displayedColumns = ['title', 'assignee', 'priority', 'dueDate', 'status', 'actions'];

  readonly statusLabels: Record<TaskStatus, string> = {
    TODO: 'À faire',
    IN_PROGRESS: 'En cours',
    DONE: 'Terminé',
  };

  readonly priorityLabels: Record<TaskPriority, string> = {
    LOW: 'Basse',
    MEDIUM: 'Moyenne',
    HIGH: 'Haute',
  };

  readonly tasks = signal<Task[]>([]);

  readonly search = signal('');
  readonly statusFilter = signal<TaskStatus | ''>('');
  readonly priorityFilter = signal<TaskPriority | ''>('');
  readonly assigneeFilter = signal<number | ''>('');
  readonly sort = signal<Sort>({ active: '', direction: '' });

  readonly assignees = computed(() => {
    const seen = new Map<number, string>();
    for (const t of this.tasks()) {
      if (t.assigneeId != null && t.assigneeName) seen.set(t.assigneeId, t.assigneeName);
    }
    return [...seen].map(([id, name]) => ({ id, name }));
  });

  readonly visibleTasks = computed(() => {
    const q = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const assignee = this.assigneeFilter();
    const rank: Record<TaskPriority, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };

    let list = this.tasks().filter(
      (t) =>
        (!q || t.title.toLowerCase().includes(q)) &&
        (!status || t.status === status) &&
        (!priority || t.priority === priority) &&
        (assignee === '' || t.assigneeId === assignee),
    );

    const { active, direction } = this.sort();
    if (active && direction) {
      const sign = direction === 'asc' ? 1 : -1;
      list = [...list].sort((a, b) => {
        switch (active) {
          case 'title':
            return sign * a.title.localeCompare(b.title, 'fr');
          case 'assignee':
            return sign * (a.assigneeName ?? '').localeCompare(b.assigneeName ?? '', 'fr');
          case 'priority':
            return sign * (rank[a.priority] - rank[b.priority]);
          case 'dueDate':
            return sign * (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999');
          case 'status':
            return sign * a.status.localeCompare(b.status);
          default:
            return 0;
        }
      });
    }
    return list;
  });

  readonly hasFilters = computed(
    () => !!(this.search() || this.statusFilter() || this.priorityFilter() || this.assigneeFilter() !== ''),
  );

  resetFilters(): void {
    this.search.set('');
    this.statusFilter.set('');
    this.priorityFilter.set('');
    this.assigneeFilter.set('');
  }
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly actionError = signal(false);

  priorityLabel(priority: TaskPriority): string {
    return this.priorityLabels[priority];
  }

  statusLabel(status: TaskStatus): string {
    return this.statusLabels[status];
  }

  ngOnInit(): void {
    this.api.getTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  readonly statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'TODO', label: 'À faire' },
    { value: 'IN_PROGRESS', label: 'En cours' },
    { value: 'DONE', label: 'Terminé' },
  ];

  changeStatus(task: Task, status: TaskStatus): void {
    if (status === task.status) return;
    const previous = task.status;
    this.actionError.set(false);
    this.setStatus(task.id, status);
    this.api.updateStatus(task.id, status).subscribe({
      error: () => {
        this.setStatus(task.id, previous);
        this.actionError.set(true);
      },
    });
  }

  private setStatus(id: number, status: TaskStatus): void {
    this.tasks.update((list) => list.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  assign(task: Task): void {
    this.dialog
      .open(AssignDialog, { data: task, width: '380px' })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        this.forbidden.set(false);
        this.actionError.set(false);
        this.api.assign(task.id, result.assigneeId).subscribe({
          next: (updated) =>
            this.tasks.update((list) =>
              list.map((t) =>
                t.id === task.id
                  ? { ...t, assigneeId: updated.assigneeId, assigneeName: updated.assigneeName }
                  : t,
              ),
            ),
          error: (e: { status?: number }) => {
            if (e.status === 403) {
              this.forbidden.set(true);
            } else {
              this.actionError.set(true);
            }
          },
        });
      });
  }

  remove(task: Task): void {
    this.dialog
      .open(DeleteDialog)
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.actionError.set(false);
        this.api.deleteTask(task.id).subscribe({
          next: () => this.tasks.update((list) => list.filter((t) => t.id !== task.id)),
          error: () => this.actionError.set(true),
        });
      });
  }
}