/**
 * Created by kuldeep on 4/4/17.
 */

import {Routes, RouterModule} from '@angular/router';
import {StoreComponent} from "./store.component";

const routes: Routes = [
    {
        path: '',
        component: StoreComponent
    }
];

export const routing = RouterModule.forChild(routes);
