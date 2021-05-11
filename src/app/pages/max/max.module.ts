import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { MaxRoutingModule } from "./max.routing";
import { MaxComponent } from "./max.component";

@NgModule({
    imports: [
        CommonModule,
        MaxRoutingModule,
        RouterModule
    ],
    declarations: [
        MaxComponent
    ],
    providers: [
    ]
})

export class MaxModule { }
