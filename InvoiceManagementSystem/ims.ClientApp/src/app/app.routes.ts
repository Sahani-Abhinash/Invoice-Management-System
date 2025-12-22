import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
// Users, Roles, and Permissions now under security folder, lazy-loaded like Companies/Branches

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'Login', pathMatch: 'full', redirectTo: 'login' },
  { path: 'companies', loadChildren: () => import('./companies/company/company.module').then(m => m.CompanyModule) },
  { path: 'branches', loadChildren: () => import('./companies/branch/branch.module').then(m => m.BranchModule) },
  { path: 'users', loadChildren: () => import('./security/users/user.module').then(m => m.UserModule) },
  { path: 'roles', loadChildren: () => import('./security/roles/role.module').then(m => m.RoleModule) },
  { path: 'permissions', loadChildren: () => import('./security/permissions/permission.module').then(m => m.PermissionModule) },
  { path: '**', redirectTo: 'home' },
  // TODO: Add routes for the following components:
  // { path: 'about', component: AboutComponent },
  // { path: 'contact', component: ContactComponent },
  // { path: 'branches', component: BranchComponent },
  // { path: 'login', component: LoginComponent },
  // { path: 'register', component: RegisterComponent },
];
