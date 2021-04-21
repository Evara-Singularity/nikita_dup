/**
 * Created by Abhishek on 4/4/17.
 */

import {Routes, RouterModule} from '@angular/router';
import {BusinessHomepageComponent} from "./businessHomepage.component";

const routes: Routes = [
    {
        path: '',
        component: BusinessHomepageComponent
    }
];

export const routing = RouterModule.forChild(routes);
