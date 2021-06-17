import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GeneralFeedbackComponent } from './general-feedback.component';

const routes: Routes = [
  {
    path: '',
    component: GeneralFeedbackComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralFeedbackRoutingModule { }
