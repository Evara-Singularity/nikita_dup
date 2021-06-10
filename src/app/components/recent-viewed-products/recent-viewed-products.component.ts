import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Output, EventEmitter } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { ProductService } from '../../utils/services/product.service';
import CONSTANTS from '../../config/constants';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';

@Component({
  selector: 'app-recent-viewed-products',
  templateUrl: './recent-viewed-products.component.html',
  styleUrls: ['./recent-viewed-products.component.scss']
})
export class RecentViewedProductsComponent implements OnInit {

  recentProductList: any = null;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  @Output() showAll: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private productService: ProductService,
    public _router: Router,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    let user = this.localStorageService.retrieve('user');
    this.getRecents(user);
  }

  getRecents(user) {
    const userId = (user['userId'])?user['userId']:null; 
    this.productService.getrecentProduct(userId).subscribe(result => {
      if (result['statusCode'] === 200) {
        this.recentProductList = result['data'];
      }
    })
  }

  openViewAllPopup(){
    this.showAll.emit(this.recentProductList);
  }

  navigateTo(url) {
    this._router.navigate(['\\' + url]);
  }


}

@NgModule({
  declarations: [
    RecentViewedProductsComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    MathCeilPipeModule,
    MathFloorPipeModule
  ],
})
export class RecentViewedProductsModule { }
