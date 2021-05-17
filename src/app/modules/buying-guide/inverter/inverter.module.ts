import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./inverter.routing";
import { InverterComponent } from "./inverter.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        InverterComponent
    ],
    providers: [
    ]
})

export class InverterModule { }