import { Routes, RouterModule } from '@angular/router';
import { PolisherComponent } from "./polisher.component";

const routes: Routes = [
    {
        path: '',
        component: PolisherComponent
    }
];

export const routing = RouterModule.forChild(routes);