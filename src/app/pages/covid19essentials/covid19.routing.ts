import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from '@app/utils/resolvers/layout.resolver';
import { Covid19Component } from './covid19.component';

const routes: Routes = [
    {
        path: '',
        component: Covid19Component,
        resolve: {
            data: LayoutResolver
        }
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class Covid19RoutingModule { }
