import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, NgModule, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/utils/services/common.service';
import { DOCUMENT } from "@angular/common";
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
  @Inject(DOCUMENT) private document;
  initialMouse;
  slideMovementTotal;
  mouseIsDown;
  slider;

  constructor(private router: Router, public commonService: CommonService) { }

  ngOnInit(): void {
  }

  raiseRFQQuote(){
    this.raiseRFQQuote$.emit();
  }

  sliderMouseDownEvent(event) {
    this.mouseIsDown = true;
    this.slideMovementTotal = this.document.getElementById('button-background').offsetWidth - this.document.getElementById('slider').offsetWidth;
    this.initialMouse = event.clientX || (event.originalEvent ? (event.originalEvent.touches[0].pageX) : 0);
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

