import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AmazingDealsComponent } from './amazingDeals.component';

const routes: Routes = [
  {
    path: '',
    component: AmazingDealsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AmazingDealsRoutingModule { }
