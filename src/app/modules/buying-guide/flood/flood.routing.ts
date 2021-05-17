import { Routes, RouterModule } from '@angular/router';
import { FloodComponent } from "./flood.component";

const routes: Routes = [
    {
        path: '',
        component: FloodComponent
    }
];

export const routing = RouterModule.forChild(routes);