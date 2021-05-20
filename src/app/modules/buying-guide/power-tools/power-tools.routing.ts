import { Routes, RouterModule } from '@angular/router';
import { PowerToolsComponent } from "./power-tools.component";

const routes: Routes = [
    {
        path: '',
        component: PowerToolsComponent
    }
];

export const routing = RouterModule.forChild(routes);