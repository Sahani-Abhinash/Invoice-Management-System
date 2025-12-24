import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WarehouseRoutingModule } from './warehouse-routing.module';
import { WarehouseListComponent } from './warehouse-list/warehouse-list.component';
import { WarehouseFormComponent } from './warehouse-form/warehouse-form.component';

@NgModule({
  imports: [
    CommonModule,
    WarehouseRoutingModule,
    WarehouseListComponent,
    WarehouseFormComponent
  ]
})
export class WarehouseModule {}
