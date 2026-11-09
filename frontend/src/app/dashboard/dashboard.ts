import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Stats } from '../models/stats';
import { TaskPriority, TaskStatus } from '../models/task';
import { TaskApi } from '../services/task-api';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly api = inject(TaskApi);

  readonly statusRows: { key: TaskStatus; label: string }[] = [
    { key: 'TODO', label: 'À faire' },
    { key: 'IN_PROGRESS', label: 'En cours' },
    { key: 'DONE', label: 'Terminé' },
  ];

  readonly priorityRows: { key: TaskPriority; label: string }[] = [
    { key: 'LOW', label: 'Basse' },
    { key: 'MEDIUM', label: 'Moyenne' },
    { key: 'HIGH', label: 'Haute' },
  ];

  readonly stats = signal<Stats | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly rate = computed(() => {
    const s = this.stats();
    return s && s.total > 0 ? Math.round((s.byStatus.DONE / s.total) * 100) : 0;
  });

  percent(count: number): number {
    const s = this.stats();
    return s && s.total > 0 ? Math.round((count / s.total) * 100) : 0;
  }

  ngOnInit(): void {
    this.api.getStats().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}