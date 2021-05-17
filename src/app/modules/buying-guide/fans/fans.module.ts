import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./fans.routing";
import { FansComponent } from "./fans.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        FansComponent
    ],
    providers: [
    ]
})

export class FansModule { }