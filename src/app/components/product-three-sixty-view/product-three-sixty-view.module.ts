import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductThreeSixtyViewComponent } from './product-three-sixty-view.component';

@NgModule({
  declarations: [
    ProductThreeSixtyViewComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[
    ProductThreeSixtyViewComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductThreeSixtyViewModule { }
