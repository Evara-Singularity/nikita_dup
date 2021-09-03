import { Routes, RouterModule } from '@angular/router';
import { BrandComponent } from "./brand.component";
import { BrandResolver } from '@app/utils/resolvers/brand.resolver';
import { NgModule } from '@angular/core';

const routes: Routes = [
    {
        path: '',
        component: BrandComponent,
        runGuardsAndResolvers: 'always',
        resolve: {
            brand: BrandResolver
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BrandRoutingModule { }
  