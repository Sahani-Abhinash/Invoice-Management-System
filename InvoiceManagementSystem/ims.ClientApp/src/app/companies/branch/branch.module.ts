import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BranchRoutingModule } from './branch-routing.module';
import { BranchListComponent } from './branch-list/branch-list.component';
import { BranchFormComponent } from './branch-form/branch-form.component';

@NgModule({
  imports: [
    CommonModule,
    BranchRoutingModule,
    BranchListComponent,
    BranchFormComponent
  ]
})
export class BranchModule { }
