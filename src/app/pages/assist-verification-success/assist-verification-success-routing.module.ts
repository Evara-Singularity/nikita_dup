import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssistVerificationSuccessComponent } from './assist-verification-success.component';


const routes: Routes = [{
  path: '',
  component: AssistVerificationSuccessComponent
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssistVerificationSuccessRoutingModule { }
