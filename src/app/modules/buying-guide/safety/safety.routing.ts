import { Routes, RouterModule } from '@angular/router';
import { SafetyComponent } from "./safety.component";

const routes: Routes = [
    {
        path: '',
        component: SafetyComponent
    }
];

export const routing = RouterModule.forChild(routes);