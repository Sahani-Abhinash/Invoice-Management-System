import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionRoutingModule } from './permission-routing.module';
import { PermissionListComponent } from './permission-list/permission-list.component';
import { PermissionFormComponent } from './permission-form/permission-form.component';

@NgModule({
  imports: [CommonModule, PermissionRoutingModule, PermissionListComponent, PermissionFormComponent]
})
export class PermissionModule {}
