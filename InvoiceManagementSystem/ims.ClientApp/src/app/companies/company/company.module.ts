import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyRoutingModule } from './company-routing.module';
import { CompanyListComponent } from './company-list/company-list.component';
import { CompanyFormComponent } from './company-form/company-form.component';

@NgModule({
  imports: [
    CommonModule,
    CompanyRoutingModule,
    CompanyListComponent,
    CompanyFormComponent
  ]
})
export class CompanyModule { }