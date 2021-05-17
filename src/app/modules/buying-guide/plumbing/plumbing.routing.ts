import { Routes, RouterModule } from '@angular/router';
import { PlumbingComponent } from "./plumbing.component";

const routes: Routes = [
    {
        path: '',
        component: PlumbingComponent
    }
];

export const routing = RouterModule.forChild(routes);