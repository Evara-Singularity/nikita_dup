/**
 * Created by Abhishek on 4/4/17.
 */

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {BusinessHomepageComponent} from "./businessHomepage.component";
import {routing} from "./businessHomepage.routing";

@NgModule({
  imports: [
    RouterModule,
    routing,
  ],
  declarations: [
    BusinessHomepageComponent
  ],
  exports: [
  ],
  providers: [
  ]
})

export class BusinessHomepageModule{}
