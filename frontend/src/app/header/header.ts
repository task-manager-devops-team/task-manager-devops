import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthApi } from '../services/auth-api';
import { ConfirmDialog } from './confirm-dialog';

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];

@Component({
  selector: 'app-header',
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly auth = inject(AuthApi);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly visible = computed(
    () => this.auth.isAuthenticated() && !AUTH_PAGES.some((page) => this.url().startsWith(page)),
  );

  logout(): void {
    this.dialog
      .open(ConfirmDialog)
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.auth.logoutRemote().subscribe(() => this.router.navigate(['/login']));
        }
      });
  }
}