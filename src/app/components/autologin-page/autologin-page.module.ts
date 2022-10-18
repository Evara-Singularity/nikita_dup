import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutologinPageComponent } from './autologin-page.component';
import { AutoLoginService } from './autoLogin.service';



@NgModule({
  declarations: [AutologinPageComponent],
  imports: [
    CommonModule
  ],
 providers: [
  AutoLoginService
 ],
 exports: [
  AutologinPageComponent
 ]
  
})
export class AutologinPageModule { }
