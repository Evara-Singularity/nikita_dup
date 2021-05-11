import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { DealsRoutingModule } from "./deals.routing";
import { DealsComponent } from './deals.component';


@NgModule({
    imports: [
        CommonModule,
        DealsRoutingModule,
        RouterModule,
    ],
    declarations: [
        DealsComponent

    ],
    exports: [
        DealsComponent
    ],
    providers: [
    ]
})
export class DealsModule { }
