/**
 * Created by kuldeep on 4/4/17.
 */

import { Routes, RouterModule } from '@angular/router';
import { ViewComponent } from "./view.component";

const routes: Routes = [
    {
        path: '',
        component: ViewComponent
    }
];

export const routing = RouterModule.forChild(routes);
