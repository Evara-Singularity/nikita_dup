import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MaxComponent } from "./max.component";

const routes: Routes = [
    {
        path: '',
        component: MaxComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MaxRoutingModule { }
