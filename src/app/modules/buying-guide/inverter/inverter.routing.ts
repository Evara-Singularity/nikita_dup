import { Routes, RouterModule } from '@angular/router';
import { InverterComponent } from "./inverter.component";

const routes: Routes = [
    {
        path: '',
        component: InverterComponent
    }
];

export const routing = RouterModule.forChild(routes);