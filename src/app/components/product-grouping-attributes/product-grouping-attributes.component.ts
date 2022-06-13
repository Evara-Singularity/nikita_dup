import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, NgModule, OnInit, Output } from '@angular/core';

@Component({
  selector: 'product-grouping-attributes',
  templateUrl: './product-grouping-attributes.component.html',
  styleUrls: ['./product-grouping-attributes.component.scss']
})
export class ProductGroupingAttributesComponent {
  @Input('isCommonProduct') isCommonProduct;
  @Output('updateAttr') updateAttr = new EventEmitter();
  @Input('productFilterAttributesList') productFilterAttributesList;
  @Output('removeOosSimilarSection') removeOosSimilarSection = new EventEmitter();
}

@NgModule({
  declarations: [
    ProductGroupingAttributesComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ProductGroupingAttributesComponent
  ]
})
export class ProductGroupingAttributesModule { }
