import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeographyRoutingModule } from './geography-routing.module';
// Standalone components are loaded via routes; no need to import here.

@NgModule({
  imports: [
    CommonModule,
    GeographyRoutingModule
  ]
})
export class GeographyModule {}
