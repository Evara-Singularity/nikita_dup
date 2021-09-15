import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CorporateGiftingComponent } from './corporate-gifting.component';

const routes: Routes = [
  {
      path: '',
      component: CorporateGiftingComponent,
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorporateGiftingRoutingModule { }
