import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Output, EventEmitter } from '@angular/core';
import { ProductService } from '../../utils/services/product.service';

@Component({
  selector: 'app-product-offers',
  templateUrl: './product-offers.component.html',
  styleUrls: ['./product-offers.component.scss']
})
export class ProductOffersComponent implements OnInit {

  allofferData: any = null;
  @Output() viewPopUpHandler: EventEmitter<any> = new EventEmitter<any>();
  @Output() emaiComparePopUpHandler: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.getOfferData();
  }

  getOfferData() {
    this.productService.getAllOffers().subscribe((data: any) => {
      if (data.statusCode == 200) {
        this.allofferData = data.data;
      }
    });
  }

  sendOfferData(offerData){
    this.viewPopUpHandler.emit(offerData);
  }

  openEmiPopup(){
    this.emaiComparePopUpHandler.emit(true);
  }

}
@NgModule({
  declarations: [ProductOffersComponent],
  imports: [
    CommonModule
  ]
})
export class ProductOffersModule{

}
