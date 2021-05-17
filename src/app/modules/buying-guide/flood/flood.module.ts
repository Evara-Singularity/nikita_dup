import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./flood.routing";
import { FloodComponent } from "./flood.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        FloodComponent
    ],
    providers: [
    ]
})

export class FloodModule { }