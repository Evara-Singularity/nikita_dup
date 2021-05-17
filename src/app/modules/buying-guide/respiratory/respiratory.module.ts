import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./respiratory.routing";
import { RespiratoryComponent } from "./respiratory.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        RespiratoryComponent
    ],
    providers: [
    ]
})

export class RespiratoryModule { }