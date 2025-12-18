import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./companies/company/company.module').then(m => m.CompanyModule) },
  { path: 'companies', loadChildren: () => import('./companies/company/company.module').then(m => m.CompanyModule) },
  // TODO: Add routes for the following components:
  // { path: 'about', component: AboutComponent },
  // { path: 'contact', component: ContactComponent },
  // { path: 'branches', component: BranchComponent },
  // { path: 'login', component: LoginComponent },
  // { path: 'register', component: RegisterComponent },
];
