import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./power.routing";
import { PowerComponent } from "./power.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        PowerComponent
    ],
    providers: [
    ]
})

export class PowerModule { }