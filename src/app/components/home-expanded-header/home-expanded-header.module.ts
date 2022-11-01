import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeExpandedHeaderComponent } from './home-expanded-header.component';
import { RouterModule } from '@angular/router';
import { MockLottiePlayerModule } from '../mock-lottie-player/mock-lottie-player.module';



@NgModule({
  declarations: [HomeExpandedHeaderComponent],
  imports: [
    CommonModule,
    RouterModule,
    MockLottiePlayerModule
  ],
  exports: [
    HomeExpandedHeaderComponent
  ]
})
export class HomeExpandedHeaderModule { }
