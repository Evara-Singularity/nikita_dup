import { Routes, RouterModule } from '@angular/router';
import { GeaserComponent } from "./geaser.component";

const routes: Routes = [
    {
        path: '',
        component: GeaserComponent
    }
];

export const routing = RouterModule.forChild(routes);