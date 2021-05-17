import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./celling.routing";
import { CellingComponent } from "./celling.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        CellingComponent
    ],
    providers: [
    ]
})

export class CellingModule { }