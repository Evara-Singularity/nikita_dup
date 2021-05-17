import { Routes, RouterModule } from '@angular/router';
import { GardenComponent } from "./gardening.component";

const routes: Routes = [
    {
        path: '',
        component: GardenComponent
    }
];

export const routing = RouterModule.forChild(routes);