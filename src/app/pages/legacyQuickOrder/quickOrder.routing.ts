import {Routes, RouterModule} from '@angular/router';
import {QuickOrderComponent} from "./quickOrder.component";
import { QuickOrderResolver } from './quickOrder.resolver';

const routes: Routes = [
    {
        path: '',
        component: QuickOrderComponent,
        resolve: {
            qores: QuickOrderResolver
        }
    }
];

export const routing = RouterModule.forChild(routes);