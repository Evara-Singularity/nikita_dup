import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotedBrandsUnitComponent } from './promoted-brands-unit/promoted-brands-unit.component';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';



@NgModule({
  declarations: [PromotedBrandsUnitComponent],
  imports: [CommonModule, ObserveVisibilityDirectiveModule],
  exports: [PromotedBrandsUnitComponent],
})
export class AdsensePromotedBrandsUnitModule {}
