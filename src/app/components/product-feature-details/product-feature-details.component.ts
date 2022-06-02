import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-product-feature-details',
  templateUrl: './product-feature-details.component.html',
  styleUrls: ['./product-feature-details.component.scss']
})
export class ProductFeatureDetailsComponent implements OnInit {

  @Input() productKeyFeatures: any;
  @Output() handleProductInfoPopup$: EventEmitter<any> = new EventEmitter<any>();
  productAttributes
  constructor() { }

  ngOnInit(): void {
  }

  handleProductInfoPopup() {
    this.handleProductInfoPopup$.emit();
  }

}

@NgModule({
  declarations: [
    ProductFeatureDetailsComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ProductFeatureDetailsComponent
  ]
})
export class ProductFeatureDetailsModule { }
