import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import {CareerComponent} from "./career.component";
import { CareerRoutingModule } from './career.routing';

@NgModule({
    imports: [
        CommonModule,
        CareerRoutingModule,
        RouterModule
    ],
    declarations: [
      CareerComponent
    ],
    exports: [
      CareerComponent
    ],
    providers: [
    ]
})

export class CareerModule{}
