import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { routing } from "./table.routing";
import { TableComponent } from "./table.component";

@NgModule({
    imports: [
        CommonModule,
        routing,
        RouterModule
    ],
    declarations: [
        TableComponent
    ],
    providers: [
    ]
})

export class TableModule { }
