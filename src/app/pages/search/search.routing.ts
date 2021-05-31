import { Routes, RouterModule } from '@angular/router';
import { SearchResolver } from '@app/utils/resolvers/search.resolver';
import { SearchComponent } from "./search.component";

const routes: Routes = [
    {
        path: '',
        component: SearchComponent,
        runGuardsAndResolvers: 'always',
        resolve: {
            search: SearchResolver
        }
    }
];

export const routing = RouterModule.forChild(routes);