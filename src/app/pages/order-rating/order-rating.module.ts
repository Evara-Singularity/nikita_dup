import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderRatingComponent } from './order-rating.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';


const routes: Routes = [
  {
    path: '',
    component: OrderRatingComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    OrderRatingComponent
  ],
  declarations: [OrderRatingComponent]
})
export class OrderRatingModule { }
