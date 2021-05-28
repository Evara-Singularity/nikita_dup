import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from '@app/utils/resolvers/layout.resolver';
import { EmailerComponent } from "./emailer.component";

const routes: Routes = [
    {
        path: '',
        component: EmailerComponent,
        resolve: {
            data: LayoutResolver
        }
    }
];

export const routing = RouterModule.forChild(routes);