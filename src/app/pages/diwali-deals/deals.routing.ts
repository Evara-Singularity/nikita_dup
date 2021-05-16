import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from '../../utils/resolvers/layout.resolver';
import { DealsComponent } from "./deals.component";

const routes: Routes = [
    {
        path: '',
        component: DealsComponent,
        resolve: {
            data: LayoutResolver
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DealsRoutingModule { }