import {Routes, RouterModule} from '@angular/router';
import {CategoryComponent} from "./category.component";

const routes: Routes = [
    {
        path: '',
        component: CategoryComponent
    }
];

export const routing = RouterModule.forChild(routes);