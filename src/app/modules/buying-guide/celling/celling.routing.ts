import { Routes, RouterModule } from '@angular/router';
import { CellingComponent } from "./celling.component";

const routes: Routes = [
    {
        path: '',
        component: CellingComponent
    }
];

export const routing = RouterModule.forChild(routes);