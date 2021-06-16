import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchV1RoutingModule } from './search-v1-routing.module';
import { SearchV1Component } from './search-v1.component';


@NgModule({
  declarations: [SearchV1Component],
  imports: [
    CommonModule,
    SearchV1RoutingModule
  ]
})
export class SearchV1Module { }
