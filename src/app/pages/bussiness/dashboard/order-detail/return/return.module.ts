import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { ReturnService } from './return.service';
import { ReturnComponent } from './return.component';
//import { ImageToSrcDirectiveModule } from 'src/app/utils/directives/imageToSrc.directive';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
   // ImageToSrcDirectiveModule
  ],
  entryComponents: [
    ReturnComponent
  ],
  declarations: [
    ReturnComponent
  ],
  providers: [
    ReturnService
  ]
})

export class ReturnModule{}