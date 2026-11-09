import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Task } from '../models/task';
import { User } from '../models/user';
import { TaskApi } from '../services/task-api';

@Component({
  selector: 'app-assign-dialog',
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>Assigner la tâche</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Membre</mat-label>
        <mat-select [(ngModel)]="selected">
          <mat-option [value]="null">Non assigné</mat-option>
          @for (u of users(); track u.id) {
            <mat-option [value]="u.id">{{ u.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Annuler</button>
      <button mat-flat-button [mat-dialog-close]="{ assigneeId: selected }">Assigner</button>
    </mat-dialog-actions>
  `,
  styles: '.full { width: 100%; }',
})
export class AssignDialog implements OnInit {
  readonly task = inject<Task>(MAT_DIALOG_DATA);
  private readonly api = inject(TaskApi);

  readonly users = signal<User[]>([]);
  selected: number | null = this.task.assigneeId ?? null;

  ngOnInit(): void {
    this.api.getUsers().subscribe({ next: (users) => this.users.set(users) });
  }
}