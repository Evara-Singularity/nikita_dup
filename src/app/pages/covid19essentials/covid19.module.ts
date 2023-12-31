import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { Covid19RoutingModule } from './covid19.routing';
import { Covid19Component } from './covid19.component';

@NgModule({
    imports: [
        CommonModule,
        Covid19RoutingModule,
        RouterModule,
    ],
    declarations: [
      Covid19Component
    ],
    exports:[
      Covid19Component
    ],
    providers: []
})

export class Covid19Module{}
