import { PopUpModule } from './../popUp/pop-up.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmiPlansComponent } from './emi-plans.component';
import { EmiStepsComponent } from './emi-steps/emi-steps.component';
import { PopUpVariant2Module } from '../pop-up-variant2/pop-up-variant2.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ArraySortPipeModule } from '@app/utils/pipes/arraySort.pipe';
import { BankNamePipeModule } from '@app/utils/pipes/bank.pipe';
import { MathCeilPipeModule } from '@app/utils/pipes/math-ceil';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import { ObjectToArrayPipeModule } from '@app/utils/pipes/object-to-array.pipe';

@NgModule({
    declarations: [EmiPlansComponent, EmiStepsComponent],
    imports: [
        CommonModule,
        PopUpVariant2Module,
        PopUpModule,
        CommonModule,
        ReactiveFormsModule,
        ObjectToArrayPipeModule,
        ArraySortPipeModule,
        PopUpModule,
        BankNamePipeModule,
        MathCeilPipeModule,
        MathFloorPipeModule
    ],
    exports: [EmiPlansComponent, EmiStepsComponent]
})
export class EmiPlansModule { }
