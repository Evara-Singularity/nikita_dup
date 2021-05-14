import { Routes, RouterModule } from '@angular/router';
import { BussinessDetailComponent } from "./bussinessDetail.component";

const routes: Routes = [
    {
        path: '',
        component: BussinessDetailComponent
    }
];

export const routing = RouterModule.forChild(routes);