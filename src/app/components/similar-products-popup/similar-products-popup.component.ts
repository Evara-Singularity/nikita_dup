import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit, Output, EventEmitter } from '@angular/core';
import CONSTANTS from '../../config/constants';
import { PopUpModule } from '../../modules/popUp/pop-up.module';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';

@Component({
  selector: 'app-similar-products-popup',
  templateUrl: './similar-products-popup.component.html',
  styleUrls: ['./similar-products-popup.component.scss']
})
export class SimilarProductsPopupComponent implements OnInit {

  readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
  openViewAllPopup: boolean = false;
  @Input() similarProducts: any = null;
  @Output() out: EventEmitter<any> =  new EventEmitter<any>();

  constructor(private router: Router) { }
  
  ngOnInit(): void {
  }

  goToProducturl(url) {
    this.router.navigateByUrl(url);
  }

  outData(data){
    this.out.emit(data);
  }

}

@NgModule({
  declarations: [
    SimilarProductsPopupComponent
  ],
  imports: [
    CommonModule,
    MathFloorPipeModule,
    MathCeilPipeModule,
    PopUpModule
  ]
})
export class SimilarProductsPopupModule { }
