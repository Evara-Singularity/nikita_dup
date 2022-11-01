import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNavigationComponent } from './bottom-navigation.component';
import { LoginPopupModule } from '../login-popup/login-popup.module';

@NgModule({
  imports: [
    CommonModule,
    LoginPopupModule
  ],
  declarations: [BottomNavigationComponent],
  exports:[BottomNavigationComponent]
})
export class BottomNavigationModule { }
