import { Routes, RouterModule } from '@angular/router';
import { BatternComponent } from "./led-battern.component";

const routes: Routes = [
    {
        path: '',
        component: BatternComponent
    }
];

export const routing = RouterModule.forChild(routes);