import { Routes, RouterModule } from '@angular/router';
import { WireComponent } from "./wire.component";

const routes: Routes = [
    {
        path: '',
        component: WireComponent
    }
];

export const routing = RouterModule.forChild(routes);