import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PermissionListComponent } from './permission-list/permission-list.component';
import { PermissionFormComponent } from './permission-form/permission-form.component';

const routes: Routes = [
  { path: '', component: PermissionListComponent },
  { path: 'create', component: PermissionFormComponent },
  { path: 'edit/:id', component: PermissionFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermissionRoutingModule {}
