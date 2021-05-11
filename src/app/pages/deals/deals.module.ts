
import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { DealsRoutingModule } from "./deals.routing";
import { DealsLayoutComponent } from './deals-layout.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,  
        DealsRoutingModule,
    ],
    declarations: [
        DealsLayoutComponent
    ],
    providers: [
    ]
})

export class DealsModule{}