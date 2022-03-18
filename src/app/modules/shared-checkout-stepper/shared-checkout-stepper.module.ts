import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedCheckoutStepperComponent } from './shared-checkout-stepper.component';



@NgModule({
    declarations: [SharedCheckoutStepperComponent],
    exports: [SharedCheckoutStepperComponent],
    imports: [CommonModule]
})
export class SharedCheckoutStepperModule { }
