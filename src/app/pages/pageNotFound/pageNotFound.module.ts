import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { PageNotFoundRoutingModule } from "./pageNotFound.routing";
import { PageNotFoundComponent } from "./pageNotFound.component";

@NgModule({
  imports: [
    CommonModule,
    PageNotFoundRoutingModule,
    RouterModule
  ],
  declarations: [
    PageNotFoundComponent
  ],
  providers: [
  ]
})
export class PageNotFoundModule { }
