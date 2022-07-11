import {Routes, RouterModule} from '@angular/router';
import CONSTANTS from '@app/config/constants';
import {QuickOrderComponent} from "./quickOrder.component";

const routes: Routes = [
    {
        path: '',
        component: QuickOrderComponent,
        data: {
            moduleName: CONSTANTS.MODULE_NAME.QUICKORDER
        },
    }
];

export const routing = RouterModule.forChild(routes);