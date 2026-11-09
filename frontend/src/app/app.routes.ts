import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { ForgotPassword } from './forgot-password/forgot-password';
import { Login } from './login/login';
import { Register } from './register/register';
import { ResetPassword } from './reset-password/reset-password';
import { TaskList } from './task-list/task-list';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'register', component: Register },
  { path: 'reset-password', component: ResetPassword },
  { path: 'dashboard', component: TaskList, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];