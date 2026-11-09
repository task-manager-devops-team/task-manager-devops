import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthApi } from '../services/auth-api';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthApi);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  auth.logout();
  return router.createUrlTree(['/login']);
};