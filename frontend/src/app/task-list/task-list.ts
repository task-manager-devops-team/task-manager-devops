import { Component, inject, OnInit, signal } from '@angular/core';
import { Task, TaskStatus } from '../models/task';
import { TaskApi } from '../services/task-api';

@Component({
  selector: 'app-task-list',
  imports: [],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  private readonly api = inject(TaskApi);

  readonly statusLabels: Record<TaskStatus, string> = {
    TODO: 'À faire',
    IN_PROGRESS: 'En cours',
    DONE: 'Terminé',
  };

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

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