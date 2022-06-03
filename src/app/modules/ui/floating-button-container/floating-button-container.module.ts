import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloatingButtonContainerComponent } from './floating-button-container.component';
import { FloatingButtonComponent } from './floating-button/floating-button.component';



@NgModule({
  declarations: [FloatingButtonContainerComponent, FloatingButtonComponent],
  imports: [
    CommonModule
  ],
  exports: [FloatingButtonContainerComponent, FloatingButtonComponent]
})
export class FloatingButtonContainerModule { }
