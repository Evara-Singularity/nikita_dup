import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';

@Component({
  selector: 'product-skeletons',
  templateUrl: './product-skeletons.component.html',
  styleUrls: ['./product-skeletons.component.scss']
})
export class ProductSkeletonsComponent implements OnInit {

  @Input() type: 'COUPON' | 'PINCODE' | 'RFQ' | 'FBT' | 'SIMILAR' | 'SPONSERED' | 'APP_PROMO' | 'RECENT' | 'POPULARDEALS'
  @Input() templateRefInstance: any = null;

  constructor() { }

  ngOnInit(): void {
  }

}

@NgModule({
  declarations: [
    ProductSkeletonsComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    ProductSkeletonsComponent
  ]
})
export class ProductSkeletonsModule { }
