import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./printer.routing";
import { PrinterComponent } from "./printer.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        PrinterComponent
    ],
    providers: [
    ]
})

export class PrinterModule { }