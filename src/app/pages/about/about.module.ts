import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';

import { AboutComponent } from "./about.component";
import { AboutRoutingModule } from './about.routing';


@NgModule({
    imports: [
        CommonModule,
        AboutRoutingModule,
        RouterModule
    ],
    declarations: [
      AboutComponent
    ],
    exports: [
      AboutComponent
    ],
    providers: [
    ]
})
export class AboutModule{}
