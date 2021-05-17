import { Routes, RouterModule } from '@angular/router';
import { RespiratoryComponent } from "./respiratory.component";

const routes: Routes = [
    {
        path: '',
        component: RespiratoryComponent
    }
];

export const routing = RouterModule.forChild(routes);