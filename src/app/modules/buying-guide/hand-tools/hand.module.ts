import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./hand.routing";
import { HandComponent } from "./hand.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        HandComponent
    ],
    providers: [
    ]
})

export class HandModule { }