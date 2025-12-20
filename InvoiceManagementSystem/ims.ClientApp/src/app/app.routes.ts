import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'companies', loadChildren: () => import('./companies/company/company.module').then(m => m.CompanyModule) },
  { path: 'branches', loadChildren: () => import('./companies/branch/branch.module').then(m => m.BranchModule) },
  // TODO: Add routes for the following components:
  // { path: 'about', component: AboutComponent },
  // { path: 'contact', component: ContactComponent },
  // { path: 'branches', component: BranchComponent },
  // { path: 'login', component: LoginComponent },
  // { path: 'register', component: RegisterComponent },
];
