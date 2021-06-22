import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GeneralFeedbackRoutingModule } from './general-feedback-routing.module';
import { SuccessComponent } from './success/success.component';
import { FeedbackComponent } from './feedback/feedback.component';
@NgModule({
  declarations: [SuccessComponent, FeedbackComponent],
  imports: [
    CommonModule,
    GeneralFeedbackRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class GeneralFeedbackModule { }
