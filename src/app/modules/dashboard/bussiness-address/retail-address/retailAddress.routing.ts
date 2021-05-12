import { Routes, RouterModule } from '@angular/router';
import { RetailAddressComponent } from "./retailAddress.component";

const routes: Routes = [
    {
        path: '',
        component: RetailAddressComponent
    }
];

export const routing = RouterModule.forChild(routes);