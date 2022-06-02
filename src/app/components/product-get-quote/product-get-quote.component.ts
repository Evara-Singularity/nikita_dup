import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
@Component({
  selector: 'app-product-get-quote',
  templateUrl: './product-get-quote.component.html',
  styleUrls: ['./product-get-quote.component.scss']
})
export class ProductGetQuoteComponent implements OnInit {

  @Input() productMrp: any;
  @Input() productOutOfStock:any;
  @Input() productCategoryDetails : any;
  @Input() productName : any;
  @Input() productAllImages : any;
  @Input() rfqQuoteRaised: boolean;
  @Output() raiseRFQQuote$: EventEmitter<any> = new EventEmitter<any>();
  @Output() sliderMouseDownEvent$: EventEmitter<any> = new EventEmitter<any>();

  constructor(private router: Router, public commonService: CommonService) { }

  ngOnInit(): void {
  }

  raiseRFQQuote(){
    this.raiseRFQQuote$.emit();
  }

  sliderMouseDownEvent(event) {
    this.sliderMouseDownEvent$.emit(event)
  }

}


@NgModule({
  declarations: [
    ProductGetQuoteComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ProductGetQuoteComponent
  ]
})
export class ProductGetQuoteModule { }

