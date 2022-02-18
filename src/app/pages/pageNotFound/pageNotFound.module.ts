import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { PageNotFoundRoutingModule } from "./pageNotFound.routing";
import { PageNotFoundComponent } from "./pageNotFound.component";
import { NotFoundModule } from "@app/modules/not-found/not-found.module";

@NgModule({
  imports: [
    CommonModule,
    PageNotFoundRoutingModule,NotFoundModule
  ],
  declarations: [
    PageNotFoundComponent
  ],
  providers: [
  ]
})
export class PageNotFoundModule { }
