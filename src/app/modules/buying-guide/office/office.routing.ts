import { Routes, RouterModule } from '@angular/router';
import { OfficeComponent } from "./office.component";

const routes: Routes = [
    {
        path: '',
        component: OfficeComponent
    }
];

export const routing = RouterModule.forChild(routes);