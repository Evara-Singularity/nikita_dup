import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./safety.routing";
import { SafetyComponent } from "./safety.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        SafetyComponent
    ],
    providers: [
    ]
})

export class SafetyModule { }
