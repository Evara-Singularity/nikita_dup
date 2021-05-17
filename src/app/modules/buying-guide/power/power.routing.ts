import { Routes, RouterModule } from '@angular/router';
import { PowerComponent } from "./power.component";

const routes: Routes = [
    {
        path: '',
        component: PowerComponent
    }
];

export const routing = RouterModule.forChild(routes);