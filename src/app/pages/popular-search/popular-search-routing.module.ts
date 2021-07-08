import { PopularSearchComponent } from './popular-search/popular-search.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PopularSearchResolver } from '../../utils/resolvers/popular-search.resolver';

const routes: Routes = [
    {
        path: '',
        component: PopularSearchComponent,
        resolve: {
            searchTerms: PopularSearchResolver
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PopularSearchRoutingModule { }
