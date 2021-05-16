import { NgModule } from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import { CareerComponent } from "./career.component";

const routes: Routes = [
    {
        path: '',
        component: CareerComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CareerRoutingModule { }
