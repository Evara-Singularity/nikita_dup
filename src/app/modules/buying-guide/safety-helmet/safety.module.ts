import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./safety.routing";
import { SafetyHelmetComponent } from "./safety.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        SafetyHelmetComponent
    ],
    providers: [
    ]
})

export class SafetyHelmetModule { }