import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./polisher.routing";
import { PolisherComponent } from "./polisher.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        PolisherComponent
    ],
    providers: [
    ]
})

export class PolisherModule { }