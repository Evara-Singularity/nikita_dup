import { Routes, RouterModule } from '@angular/router';
import { AngleComponent } from "./angle.component";

const routes: Routes = [
    {
        path: '',
        component: AngleComponent
    }
];

export const routing = RouterModule.forChild(routes);