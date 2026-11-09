import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Task, TaskPriority } from '../models/task';
import { TaskApi } from '../services/task-api';

@Component({
  selector: 'app-archives',
  imports: [DatePipe, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatTableModule],
  templateUrl: './archives.html',
  styleUrl: './archives.css',
})
export class Archives implements OnInit {
  private readonly api = inject(TaskApi);

  readonly displayedColumns = ['title', 'assignee', 'priority', 'dueDate', 'actions'];
  readonly priorityLabels: Record<TaskPriority, string> = {
    LOW: 'Basse',
    MEDIUM: 'Moyenne',
    HIGH: 'Haute',
  };

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly actionError = signal(false);

  ngOnInit(): void {
    this.api.getTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks.filter((t) => t.archived));
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  priorityLabel(priority: TaskPriority): string {
    return this.priorityLabels[priority];
  }

  restore(task: Task): void {
    this.actionError.set(false);
    this.api.archive(task.id, false).subscribe({
      next: () => this.tasks.update((list) => list.filter((t) => t.id !== task.id)),
      error: () => this.actionError.set(true),
    });
  }
}