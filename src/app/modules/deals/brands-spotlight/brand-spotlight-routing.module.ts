import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from '@app/utils/resolvers/layout.resolver';
import { BrandSpotlightComponent } from './brands-spotlight.component';

const routes: Routes = [
  {
    path: '',
    component: BrandSpotlightComponent,
    resolve: {
      data: LayoutResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BrandSpotlightRoutingModule { }