import { Routes, RouterModule } from '@angular/router';
import { BussinessAddressComponent } from "./bussinessAddress.component";

const routes: Routes = [
    {
        path: '',
        component: BussinessAddressComponent,
        children: [
            {
                path: '',
                loadChildren: () => import('./retail-address/retailAddress.module').then(m => m.RetailAddressModule)
            }
        ]
    }
];

export const routing = RouterModule.forChild(routes);