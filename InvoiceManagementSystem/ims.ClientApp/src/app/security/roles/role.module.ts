import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleRoutingModule } from './role-routing.module';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleFormComponent } from './role-form/role-form.component';

@NgModule({
  imports: [CommonModule, RoleRoutingModule, RoleListComponent, RoleFormComponent]
})
export class RoleModule {}
