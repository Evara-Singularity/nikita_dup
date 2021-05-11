import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import {PressComponent} from "./press.component";
import { PressRoutingModule } from './press.routing';

@NgModule({
    imports: [
        CommonModule,
        PressRoutingModule,
        RouterModule
    ],
    declarations: [
      PressComponent
    ],
    exports: [
      PressComponent
    ],
    providers: [
    ]
})
export class PressModule{}
