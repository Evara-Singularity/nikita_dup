import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OosSimilarSectionComponent } from './oos-similar-section.component';
import { ProductCardSkeletonModule } from '@app/modules/product-card/product-card-skeleton/product-card-skeleton.module';
import { ProductCardHorizontalGridViewModule } from '@app/modules/product-card/product-card-horizontal-grid-view/product-card-horizontal-grid-view.module';



@NgModule({
  declarations: [
    OosSimilarSectionComponent,
  ],
  imports: [
    CommonModule, 
    ProductCardSkeletonModule,
    ProductCardHorizontalGridViewModule
  ]
})
export class OosSimilarSectionModule { } 
