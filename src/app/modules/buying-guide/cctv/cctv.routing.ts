import { Routes, RouterModule } from '@angular/router';
import { CctvComponent } from "./cctv.component";

const routes: Routes = [
    {
        path: '',
        component: CctvComponent
    }
];

export const routing = RouterModule.forChild(routes);