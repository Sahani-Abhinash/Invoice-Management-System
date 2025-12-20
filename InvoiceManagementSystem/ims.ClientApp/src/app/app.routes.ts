import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'Login', pathMatch: 'full', redirectTo: 'login' },
  { path: 'companies', loadChildren: () => import('./companies/company/company.module').then(m => m.CompanyModule) },
  { path: 'branches', loadChildren: () => import('./companies/branch/branch.module').then(m => m.BranchModule) },
  { path: '**', redirectTo: 'home' },
  // TODO: Add routes for the following components:
  // { path: 'about', component: AboutComponent },
  // { path: 'contact', component: ContactComponent },
  // { path: 'branches', component: BranchComponent },
  // { path: 'login', component: LoginComponent },
  // { path: 'register', component: RegisterComponent },
];
