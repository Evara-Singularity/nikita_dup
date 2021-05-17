import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./led-battern.routing";
import { BatternComponent } from "./led-battern.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        BatternComponent
    ],
    providers: [
    ]
})

export class BatternModule { }