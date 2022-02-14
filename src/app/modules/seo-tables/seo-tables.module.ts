import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import { ReplacePipeModule } from '@app/utils/pipes/remove-html-from-string.pipe.';
import { RouterModule } from '@angular/router';
import { PriceListTableComponent } from './../../components/tables/price-list-table/price-list-table.component';
import { PriceRangleTableComponent } from './../../components/tables/price-rangle-table/price-rangle-table.component';



@NgModule({
  declarations: [
    PriceListTableComponent, 
    PriceRangleTableComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    KpToggleDirectiveModule,
		MathFloorPipeModule,
    ReplacePipeModule,
  ],
  exports: [
    PriceRangleTableComponent,
    PriceListTableComponent
  ]
})
export class SeoTablesModule { }
