  import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordianComponent } from './accordian.component';
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';




@NgModule({
  declarations: [AccordianComponent],
  imports: [
    CommonModule,
    KpToggleDirectiveModule
  ],
  exports:[AccordianComponent]

})
export class AccordianModule { }
