
import { Routes, RouterModule } from '@angular/router';
import { PopularProductComponent } from "./popularProduct.component";

const routes: Routes = [
    {
        path: '',
        component: PopularProductComponent
    }
];

export const routing = RouterModule.forChild(routes);
