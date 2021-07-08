import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from '@app/utils/resolvers/layout.resolver';
import { ExclusiveComponent } from './exclusive.component';

const routes: Routes = [
  {
    path: '',
    component: ExclusiveComponent,
    resolve: {
      data: LayoutResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExclusiveRoutingModule { }