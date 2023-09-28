import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloatingButtonContainerComponent } from './floating-button-container.component';
import { FloatingButtonComponent } from './floating-button/floating-button.component';
import { MockLottiePlayerModule } from '@app/components/mock-lottie-player/mock-lottie-player.module';



@NgModule({
  declarations: [FloatingButtonContainerComponent, FloatingButtonComponent],
  imports: [
    CommonModule,
    MockLottiePlayerModule
  ],
  exports: [FloatingButtonContainerComponent, FloatingButtonComponent]
})
export class FloatingButtonContainerModule { }
