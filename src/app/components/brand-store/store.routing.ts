/**
 * Created by kuldeep on 4/4/17.
 */

import {Routes, RouterModule} from '@angular/router';
import { LayoutResolver } from 'src/app/utils/resolvers/layout.resolver';
import {StoreComponent} from "./store.component";

const routes: Routes = [
    {
        path: '',
        component: StoreComponent,
        resolve: {
            data: LayoutResolver
        }
    }
];

export const routing = RouterModule.forChild(routes);
