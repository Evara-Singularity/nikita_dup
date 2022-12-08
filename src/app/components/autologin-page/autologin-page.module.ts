import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutologinPageComponent } from './autologin-page.component';
import { AutoLoginService } from './autoLogin.service';
import { GlobalLoaderModule } from '@app/modules/global-loader/global-loader.module';
import { LoginPopupModule } from '@app/modules/login-popup/login-popup.module';



@NgModule({
  declarations: [AutologinPageComponent],
  imports: [
    CommonModule,
    GlobalLoaderModule,
    LoginPopupModule
  ],
 providers: [
  AutoLoginService
 ],
 exports: [
  AutologinPageComponent
 ]
  
})
export class AutologinPageModule { }
