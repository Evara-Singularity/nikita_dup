import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchV1Resolver } from '@app/utils/search-v1.resolver';
import { SearchV1Component } from './search-v1.component';

const routes: Routes = [{
  path: '',
  component: SearchV1Component,
  runGuardsAndResolvers: 'always',
  resolve: {
    searchData: SearchV1Resolver
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchV1RoutingModule { }
