import { Routes, RouterModule } from '@angular/router';
import { BussinessInsightComponent } from "./bussinessInsight.component";

const routes: Routes = [
    {
        path: '',
        component: BussinessInsightComponent
    }
];

export const routing = RouterModule.forChild(routes);