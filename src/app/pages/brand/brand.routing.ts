import { Routes, RouterModule } from '@angular/router';
import { BrandComponent } from "./brand.component";
import { BrandResolver } from '@app/utils/resolvers/brand.resolver';

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

export const routing = RouterModule.forChild(routes);