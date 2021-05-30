import { Routes, RouterModule } from '@angular/router';
import { AlpResolver } from '@app/utils/resolvers/alp.resolver';
import { AlpComponent } from "./alp.component";

const routes: Routes = [
    {
        path: '',
        component: AlpComponent,
        runGuardsAndResolvers: 'always',
        resolve: {
            alp: AlpResolver
        },
    }
];

export const routing = RouterModule.forChild(routes);