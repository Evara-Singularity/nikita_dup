import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from 'src/app/utils/resolvers/layout.resolver';
import { MadeInIndiaComponent } from './madeInIndia.component';

const routes: Routes = [
  {
    path: '',
    component: MadeInIndiaComponent,
    resolve: {
      data: LayoutResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MadeInIndiaRoutingModule { }