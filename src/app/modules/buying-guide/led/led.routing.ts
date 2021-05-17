import { Routes, RouterModule } from '@angular/router';
import { LedComponent } from "./led.component";

const routes: Routes = [
    {
        path: '',
        component: LedComponent
    }
];

export const routing = RouterModule.forChild(routes);