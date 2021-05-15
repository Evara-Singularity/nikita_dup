import {Routes, RouterModule} from '@angular/router';
import { BrandStoreResolver } from 'src/app/utils/resolvers/brandstore.resolver';
import {BrandComponent} from "./brand.component";

const routes: Routes = [
    {
        path: '',
        component: BrandComponent,
        resolve: {
            brandData: BrandStoreResolver
        }
    }
];

export const routing = RouterModule.forChild(routes);
