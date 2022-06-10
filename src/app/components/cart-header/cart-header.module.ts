import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartHeaderComponent } from './cart-header.component';


@NgModule({
  declarations: [CartHeaderComponent],
  imports: [
    CommonModule
  ],
  exports: [CartHeaderComponent]
})
export class CartHeaderModule { }
