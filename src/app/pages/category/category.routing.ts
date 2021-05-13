import {Routes, RouterModule} from '@angular/router';
import { CategoryResolver } from '@app/utils/resolvers/category.resolver';
import { CategoryComponent } from "./category.component";

const routes: Routes = [
    {
        path: '',
        component: CategoryComponent,
        resolve: {
            category: CategoryResolver
        }
    }
];

export const routing = RouterModule.forChild(routes);