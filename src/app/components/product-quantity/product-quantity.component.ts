import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, NgModule, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-product-quantity',
  templateUrl: './product-quantity.component.html',
  styleUrls: ['./product-quantity.component.scss']
})
export class ProductQuantityComponent {
  @Input('isCommonProduct') isCommonProduct;
  @Output('updateAttr') updateAttr = new EventEmitter();
  @Input('productFilterAttributesList') productFilterAttributesList;
  @Output('removeOosSimilarSection') removeOosSimilarSection = new EventEmitter();
}

@NgModule({
  declarations: [
    ProductQuantityComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ProductQuantityComponent
  ]
})
export class ProductQuantityModule { }
