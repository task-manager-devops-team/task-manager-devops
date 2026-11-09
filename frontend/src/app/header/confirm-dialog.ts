import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Se déconnecter ?</h2>
    <mat-dialog-content>Voulez-vous vraiment fermer votre session ?</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Annuler</button>
      <button mat-flat-button [mat-dialog-close]="true">Se déconnecter</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialog {}