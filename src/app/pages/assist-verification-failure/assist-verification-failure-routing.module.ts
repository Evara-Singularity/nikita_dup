import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssistVerificationFailureComponent } from './assist-verification-failure.component';


const routes: Routes = [{
  path: '',
  component: AssistVerificationFailureComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssistVerificationFailureRoutingModule { }
