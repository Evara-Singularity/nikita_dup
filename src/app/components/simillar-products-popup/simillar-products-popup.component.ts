import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';
import { SimilarProductModule } from '../similar-products/similar-products.component';

@Component({
  selector: 'simillar-products-popup',
  templateUrl: './simillar-products-popup.component.html',
  styleUrls: ['./simillar-products-popup.component.scss']
})
export class SimillarProductsPopupComponent {

  @Output('closePopup$') closePopup$ = new EventEmitter();
  @Input('msnid') msnid: string = ""; 
  @Input('productName') productName: string = "";
  isSimilarDataLoaded: Boolean = true;


  closePopup(){
    this.closePopup$.emit(true);
  }

  similarDataLoaded(isLoaded){
    this.isSimilarDataLoaded = isLoaded;
  }

}

@NgModule({
  declarations: [SimillarProductsPopupComponent],
  imports: [
    CommonModule,
    BottomMenuModule,
    SimilarProductModule
  ]
})
export class SimillarProductsPopupModule { }
