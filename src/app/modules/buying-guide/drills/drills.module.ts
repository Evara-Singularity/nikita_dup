/**
 * Created by kuldeep on 4/4/17.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./drills.routing";
import {DrillComponent} from "./drills.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
      DrillComponent
    ],
    exports: [
      DrillComponent
    ],
    providers: [
    ]
})

export class DrillModule{}
