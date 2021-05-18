import { Routes, RouterModule } from '@angular/router';
import { SafetyHelmetComponent } from "./safety.component";

const routes: Routes = [
    {
        path: '',
        component: SafetyHelmetComponent
    }
];

export const routing = RouterModule.forChild(routes);