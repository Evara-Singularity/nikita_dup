import {Routes, RouterModule} from '@angular/router';
import { LayoutResolver } from '@app/utils/resolvers/layout.resolver';
import {StoreComponent} from "./store.component";

const routes: Routes = [
    {
        path: '',
        component: StoreComponent,
        resolve: {
            data: LayoutResolver
        }
    }
];

export const routing = RouterModule.forChild(routes);
