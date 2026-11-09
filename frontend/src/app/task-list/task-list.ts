import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { Task, TaskPriority, TaskStatus } from '../models/task';
import { TaskApi } from '../services/task-api';
import { DeleteDialog } from './delete-dialog';

@Component({
  selector: 'app-task-list',
  imports: [
    DatePipe,
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