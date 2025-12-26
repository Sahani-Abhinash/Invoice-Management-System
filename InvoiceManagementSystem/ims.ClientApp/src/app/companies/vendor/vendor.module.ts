import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendorRoutingModule } from './vendor-routing.module';
import { VendorListComponent } from './vendor-list/vendor-list.component';
import { VendorFormComponent } from './vendor-form/vendor-form.component';

@NgModule({
  imports: [
    CommonModule,
    VendorRoutingModule,
    VendorListComponent,
    VendorFormComponent
  ]
})
export class VendorModule {}
