import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CorporateGiftingResolver } from '@app/utils/resolvers/corporate-gifting.resolver';
import { CorporateGiftingComponent } from './corporate-gifting.component';

const routes: Routes = [
  {
      path: '',
      component: CorporateGiftingComponent,
      resolve: {
        data: CorporateGiftingResolver, 
      }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorporateGiftingRoutingModule { }
