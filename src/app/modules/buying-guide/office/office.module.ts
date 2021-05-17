import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./office.routing";
import { OfficeComponent } from "./office.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        OfficeComponent
    ],
    providers: [
    ]
})

export class OfficeModule { }
