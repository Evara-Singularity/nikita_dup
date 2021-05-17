import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./geaser.routing";
import { GeaserComponent } from "./geaser.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        GeaserComponent
    ],
    providers: [
    ]
})

export class GeaserModule { }