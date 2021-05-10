import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { Covid19RoutingModule } from './covid19.routing';
import { LoaderModule } from '../../modules/loader/loader.module';
import { Covid19Component } from './covid19.component';
import { Covid19Service } from './covid19.service';

@NgModule({
    imports: [
        CommonModule,
        Covid19RoutingModule,
        RouterModule,
        LoaderModule,
    ],
    declarations: [
      Covid19Component
    ],
    exports:[
      Covid19Component
    ],
    providers: [
      Covid19Service
    ]
})

export class Covid19Module{}
