import { Routes, RouterModule } from '@angular/router';
import { BussinessAddressComponent } from "./bussinessAddress.component";

const routes: Routes = [
    {
        path: '',
        component: BussinessAddressComponent,
        children: [
            {
                path: 'retail',
                loadChildren: () => import('./retail-address/retailAddress.module').then(m => m.RetailAddressModule)
            },
            {
                path: 'tax',
                loadChildren: () => import('./tax-address/taxAddress.module').then(m => m.TaxAddressModule)
            },
            {
                path: '',
                loadChildren: () => import('./retail-address/retailAddress.module').then(m => m.RetailAddressModule)
            }
        ]
    }
];

export const routing = RouterModule.forChild(routes);