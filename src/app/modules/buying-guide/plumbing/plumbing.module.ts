import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./plumbing.routing";
import { PlumbingComponent } from "./plumbing.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        PlumbingComponent
    ],
    providers: [
    ]
})

export class PlumbingModule { }