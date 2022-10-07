import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockLottiePlayerComponent } from './mock-lottie-player.component';



@NgModule({
  declarations: [
    MockLottiePlayerComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[
    MockLottiePlayerComponent
  ]
})
export class MockLottiePlayerModule { }
