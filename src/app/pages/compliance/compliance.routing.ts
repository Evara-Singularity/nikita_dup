import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComplianceComponent } from "./compliance.component";

const routes: Routes = [
    {
        path: '',
        component: ComplianceComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ComplianceRoutingeModule { }