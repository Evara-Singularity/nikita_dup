import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BusinessDashboardComponent } from './dashboard.component';
import { routing } from './dashboard.routing';
import { DashboardService } from '../dashboard.service';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        routing
    ],
    declarations: [
        BusinessDashboardComponent
    ],
    exports: [
        BusinessDashboardComponent
    ],
    providers: [
        DashboardService
    ]
})

export class BusinessDashboardModule { }