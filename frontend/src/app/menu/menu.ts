import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthApi } from '../services/auth-api';

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
}

@Component({
  selector: 'app-menu',
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  private readonly auth = inject(AuthApi);
  private readonly router = inject(Router);

  readonly items: MenuItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard' },
    { label: 'Mes tâches', icon: 'checklist', route: '/tasks' },
    { label: 'Nouvelle tâche', icon: 'add_task', route: '/tasks/new' },
    { label: 'Membres', icon: 'group' },
    { label: 'Projets', icon: 'folder' },
    { label: 'Catégories', icon: 'label' },
    { label: 'Archives', icon: 'inventory_2' },
    { label: 'Historique', icon: 'history' },
  ];

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
}