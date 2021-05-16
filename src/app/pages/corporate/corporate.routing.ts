import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from '@app/utils/resolvers/layout.resolver';
import { CorporateComponent } from "./corporate.component";

const routes: Routes = [
    {
        path: '',
        component: CorporateComponent,
        resolve: {
            data: LayoutResolver
        }

    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CorporateRoutingModule { }
