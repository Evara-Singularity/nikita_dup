import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import {AffiliateComponent} from "./affiliate.component";
import { AffiliateRoutingeModule } from './affiliate.routing';

@NgModule({
    imports: [
        CommonModule,
        AffiliateRoutingeModule,
        RouterModule
    ],
    declarations: [
      AffiliateComponent,
    ],
    exports:[
      AffiliateComponent
    ],
    providers: [
    ]
})
export class AffiliateModule{}
