import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';

@Component({
  selector: 'product-benefits',
  templateUrl: './product-benefits.component.html',
  styleUrls: ['./product-benefits.component.scss']
})
export class ProductBenefitsComponent implements OnInit {

  @Input() isProductReturnAble: boolean;
  @Input() productOutOfStock: boolean;
  @Output() navigateToFAQ$: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  navigateToFAQ() {
    this.navigateToFAQ$.emit();
  }

}

@NgModule({
  declarations: [ProductBenefitsComponent],
  imports: [
    CommonModule,
  ],
  exports: [
    ProductBenefitsComponent
  ]
})
export class ProductBenefitsModule { }