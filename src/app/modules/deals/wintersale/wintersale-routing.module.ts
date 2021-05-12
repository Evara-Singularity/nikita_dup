import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from '@app/utils/resolvers/layout.resolver';
import { WinterComponent } from './winter.component';

const routes: Routes = [
  {
    path: '',
    component: WinterComponent,
    resolve: {
      data: LayoutResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WintersaleRoutingModule { }