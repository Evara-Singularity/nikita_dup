import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssistVerificationFailureRoutingModule } from './assist-verification-failure-routing.module';
import { AssistVerificationFailureComponent } from './assist-verification-failure.component';


@NgModule({
  declarations: [AssistVerificationFailureComponent],
  imports: [
    CommonModule,
    AssistVerificationFailureRoutingModule
  ]
})
export class AssistVerificationFailureModule { }
