import { Routes, RouterModule } from '@angular/router';
import { FansComponent } from "./fans.component";

const routes: Routes = [
    {
        path: '',
        component: FansComponent
    }
];

export const routing = RouterModule.forChild(routes);