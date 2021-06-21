import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssistVerificationSuccessRoutingModule } from './assist-verification-success-routing.module';
import { AssistVerificationSuccessComponent } from './assist-verification-success.component';


@NgModule({
  declarations: [AssistVerificationSuccessComponent],
  imports: [
    CommonModule,
    AssistVerificationSuccessRoutingModule
  ]
})
export class AssistVerificationSuccessModule { }
