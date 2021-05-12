import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { BussinessAddressComponent } from "./bussinessAddress.component";
import { routing } from "./businessAddress.routing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from '@angular/common/http';
import { LoaderModule } from 'src/app/modules/loader/loader.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    routing,
    LoaderModule,
    ReactiveFormsModule
  ],
  declarations: [
    BussinessAddressComponent

  ],
  exports: [
  ],
  providers: [
  ]
})

export class BusinessAddressModule { }