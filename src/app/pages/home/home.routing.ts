import {Routes, RouterModule} from '@angular/router';
import { HomeResolver } from 'src/app/utils/resolvers/home.resolver';
import {HomeComponent} from "./home.component";

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        resolve: {
            homeData: HomeResolver
        }
        
    }
];

export const routing = RouterModule.forChild(routes);