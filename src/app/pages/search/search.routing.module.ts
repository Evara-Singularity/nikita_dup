import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchResolver } from '@app/utils/resolvers/search.resolver';
import { SearchComponent } from './search.component';

const routes: Routes = [{
  path: '',
  component: SearchComponent,
  runGuardsAndResolvers: 'always',
  resolve: {
    searchData: SearchResolver
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchV1RoutingModule { }
