import { NgModule } from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AffiliateComponent} from "./affiliate.component";

const routes: Routes = [
    {
        path: '',
        component: AffiliateComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AffiliateRoutingeModule { }
