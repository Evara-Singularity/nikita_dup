import { Routes, RouterModule } from '@angular/router';
import { DrillComponent } from "./drills.component";

const routes: Routes = [
    {
        path: '',
        component: DrillComponent
    }
];

export const routing = RouterModule.forChild(routes);