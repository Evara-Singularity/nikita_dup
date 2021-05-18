import { Routes, RouterModule } from '@angular/router';
import { HandComponent } from "./hand.component";

const routes: Routes = [
    {
        path: '',
        component: HandComponent
    }
];

export const routing = RouterModule.forChild(routes);