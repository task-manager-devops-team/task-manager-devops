import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Task, TaskPriority, TaskStatus } from '../models/task';
import { TaskApi } from '../services/task-api';

@Component({
  selector: 'app-task-list',
  imports: [DatePipe, MatCardModule, MatProgressSpinnerModule, MatTableModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  private readonly api = inject(TaskApi);

  readonly displayedColumns = ['title', 'priority', 'dueDate', 'status'];

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
}