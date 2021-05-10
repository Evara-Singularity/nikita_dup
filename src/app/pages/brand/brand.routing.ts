/**
 * Created by kuldeep on 4/4/17.
 */

import {Routes, RouterModule} from '@angular/router';
import {BrandComponent} from "./brand.component";

const routes: Routes = [
    {
        path: '',
        component: BrandComponent
    }
];

export const routing = RouterModule.forChild(routes);