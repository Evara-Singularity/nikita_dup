import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkRquestFormPopupComponent } from './bulk-rquest-form-popup.component';
import { PopUpModule } from "@modules/popUp/pop-up.module";

@NgModule({
  declarations: [BulkRquestFormPopupComponent],
  imports: [
    CommonModule,
    PopUpModule
  ],
  exports: [
    BulkRquestFormPopupComponent
  ]
})
export class BulkRquestFormPopupModule { }
