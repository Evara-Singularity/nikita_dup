import {Routes, RouterModule} from '@angular/router';
import {QuickOrderComponent} from "./quickOrder.component";

const routes: Routes = [
    {
        path: '',
        component: QuickOrderComponent,
    }
];

export const routing = RouterModule.forChild(routes);