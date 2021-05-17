import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./gardening.routing";
import { GardenComponent } from "./gardening.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        GardenComponent
    ],
    providers: [
    ]
})

export class GardenModule { }