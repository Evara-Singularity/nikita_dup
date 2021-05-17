import { Routes, RouterModule } from '@angular/router';
import { DiagnosticComponent } from "./diagnostic.component";

const routes: Routes = [
    {
        path: '',
        component: DiagnosticComponent
    }
];

export const routing = RouterModule.forChild(routes);