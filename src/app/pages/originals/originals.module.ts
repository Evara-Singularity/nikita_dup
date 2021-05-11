import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import {OriginalsComponent} from "./originals.component";
import { OriginalsRoutingModule } from './originals.routing';

@NgModule({
    imports: [
        CommonModule,
        OriginalsRoutingModule,
        RouterModule
    ],
    declarations: [
      OriginalsComponent
    ],
    exports: [
      OriginalsComponent
    ],
    providers: [
    ]
})
export class OriginalsModule{}
