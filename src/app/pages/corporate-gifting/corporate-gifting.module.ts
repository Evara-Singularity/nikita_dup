import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CorporateGiftingRoutingModule } from './corporate-gifting-routing';
import { CorporateGiftingComponent } from './corporate-gifting.component';
import { ToastMessageModule } from '@app/modules/toastMessage/toast-message.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NumberDirectiveModule } from '@app/utils/directives/numeric-only.directive';


@NgModule({
  declarations: [CorporateGiftingComponent],
  imports: [
    CommonModule,
    CorporateGiftingRoutingModule,
    ToastMessageModule,
    ReactiveFormsModule,
    NumberDirectiveModule
  ],
  exports:[
    CorporateGiftingComponent
  ]
})
export class CorporateGiftingModule { }
