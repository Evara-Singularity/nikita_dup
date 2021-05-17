import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./wire.routing";
import { WireComponent } from "./wire.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        WireComponent
    ],
    providers: [
    ]
})

export class WireModule { }
