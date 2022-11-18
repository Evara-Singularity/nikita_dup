import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutologinPageComponent } from './autologin-page.component';
import { AutoLoginService } from './autoLogin.service';
import { GlobalLoaderModule } from '@app/modules/global-loader/global-loader.module';



@NgModule({
  declarations: [AutologinPageComponent],
  imports: [
    CommonModule,
    GlobalLoaderModule
  ],
 providers: [
  AutoLoginService
 ],
 exports: [
  AutologinPageComponent
 ]
  
})
export class AutologinPageModule { }
