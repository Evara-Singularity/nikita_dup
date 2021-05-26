import { NgModule } from '@angular/core';

import { ContinueComponent } from './continue.component';
import { CommonModule } from '@angular/common';
import { MathCeilPipeModule } from '@app/utils/pipes/math-ceil';


@NgModule({
    imports: [
        CommonModule,
        MathCeilPipeModule,
    ],
    exports: [ContinueComponent],
    declarations: [ContinueComponent],
    providers: [],
})
export class ContinueModule { }
