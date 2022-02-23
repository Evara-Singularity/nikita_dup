import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CheckoutLoginComponent } from './checkout-login.component';

const routes: Routes = [
  {
    path: '',
    component: CheckoutLoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutLoginRoutingModule { }
