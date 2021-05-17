import { Routes, RouterModule } from '@angular/router';
import { StablizerComponent } from "./stablizer.component";

const routes: Routes = [
    {
        path: '',
        component: StablizerComponent
    }
];

export const routing = RouterModule.forChild(routes);