import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralFeedbackRoutingModule } from './general-feedback-routing.module';
import { GeneralFeedbackComponent } from './general-feedback.component';


@NgModule({
  declarations: [GeneralFeedbackComponent],
  imports: [
    CommonModule,
    GeneralFeedbackRoutingModule
  ]
})
export class GeneralFeedbackModule { }
