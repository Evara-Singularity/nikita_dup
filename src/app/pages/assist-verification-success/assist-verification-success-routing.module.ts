import { NgModule } from '@angular/core';
import { Title } from '@angular/platform-browser';
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
export class AssistVerificationSuccessRoutingModule {
  constructor(private titleService:Title) {
    this.titleService.setTitle("Shop online for Industrial & Home Products: Tools, Electricals, Safety Equipment & more. - Moglix.com");
  }
}
