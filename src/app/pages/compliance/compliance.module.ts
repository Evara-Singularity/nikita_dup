import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import {ComplianceComponent} from "./compliance.component";
import { ComplianceRoutingeModule } from './compliance.routing';

@NgModule({
    imports: [
        CommonModule,
        ComplianceRoutingeModule,
        RouterModule
    ],
    declarations: [
      ComplianceComponent
    ],
    exports: [
      ComplianceComponent
    ],
    providers: [
    ]
})
export class complianceModule{}
