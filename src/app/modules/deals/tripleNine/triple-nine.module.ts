import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripleNineRoutingModule } from './triple-nine-routing.module';
import { TripleNineComponent } from './tripleNine.component';

@NgModule({
  declarations: [
    TripleNineComponent
  ],
  imports: [
    CommonModule,
    TripleNineRoutingModule
  ]
})
export class TripleNineModule { }