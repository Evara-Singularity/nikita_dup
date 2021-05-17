import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./shoe.routing";
import { SafetyShoeComponent } from "./shoe.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        SafetyShoeComponent
    ],
    providers: [
    ]
})

export class ShoeModule { }