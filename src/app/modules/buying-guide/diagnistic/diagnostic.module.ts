import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./diagnostic.routing";
import { DiagnosticComponent } from "./diagnostic.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        DiagnosticComponent
    ],
    providers: [
    ]
})

export class DiagnosticModule { }