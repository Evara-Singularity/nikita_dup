import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, NgModule, OnInit, Output, ComponentFactoryResolver, ViewContainerRef, ViewChild, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { ClientUtility } from '@app/utils/client.utility';
import { NumberDirectiveModule } from '@app/utils/directives/numeric-only.directive';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import { CommonService } from '../../utils/services/common.service';
import { PopUpModule } from '../../modules/popUp/pop-up.module';
import CONSTANTS from '../../config/constants';
import { ObserveVisibilityDirectiveModule } from '../../utils/directives/observe-visibility.directive';


@Component({
  selector: 'product-description',
  templateUrl: './product-description.component.html',
  styleUrls: ['./product-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDescriptionComponent implements OnInit {

  product3dInstance = null;
  @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild("product3dContainerRef", { read: ViewContainerRef })
  product3dContainerRef: ViewContainerRef;
  productStaticData = this._commonService.defaultLocaleValue;
  show360popupFlag:boolean = false;
  showPocMsn:boolean = false;

  
  @Input() productName;
  @Input() productPrice;
  @Input() productMrp;
  @Input() priceWithoutTax;
  @Input() productDiscount;
  @Input() bulkPriceWithoutTax;
  @Input() taxPercentage;
  @Input() productOutOfStock;
  @Input() productMinimmumQuantity;
  @Input() priceQuantityCountry;
  @Input() starsCount;
  @Input() rawReviewsCount;
  @Input() rawProductCountMessage;
  @Input() qunatityFormControl;
  @Input() isBulkPricesProduct;
  @Input() productBulkPrices;
  @Input() selectedProductBulkPrice;
  @Input() bulkSellingPrice;
  @Input() msnId;
  @Output() checkCartQuantityAndUpdate$: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _tms: ToastMessageService,
    public _commonService:CommonService,
    private _componentFactoryResolver:ComponentFactoryResolver,
    private injector: Injector
    ) {
   }

  ngOnInit(): void {
    if(this.msnId === CONSTANTS.POC_MSN){
      this.showPocMsn = true;
    }
   this.getStaticSubjectData();
  }
  
  getStaticSubjectData(){
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
    });
  }
  updateProductQunatity(type: 'INCREMENT' | 'DECREMENT') {
    switch (type) {
      case 'DECREMENT':
        this.checkCartQuantityAndUpdate((this.cartQunatityForProduct - 1))
        break;
      case 'INCREMENT':
        this.checkCartQuantityAndUpdate((this.cartQunatityForProduct + 1))
        break;
      default:
        break;
    }
  }

  get cartQunatityForProduct() {
    return parseInt(this.qunatityFormControl.value) || 1;
  }

  private checkCartQuantityAndUpdate(value): void {
    this.checkCartQuantityAndUpdate$.emit(value);
  }

  onChangeCartQuanityValue() {
    this.checkCartQuantityAndUpdate(this.qunatityFormControl.value);
  }

  scrollToResults(id: string, offset) {
    if (document.getElementById(id)) {
      let footerOffset = document.getElementById(id).offsetTop;
      ClientUtility.scrollToTop(1000, footerOffset + offset);
    }
  }
  show360popup(){
    this.show360popupFlag = true;
  }

  async load360ViewComponent(){
      const { ProductThreeSixtyViewComponent } = await import('../product-three-sixty-view/product-three-sixty-view.component');
      const factory = this._componentFactoryResolver.resolveComponentFactory(ProductThreeSixtyViewComponent);
      this.product3dInstance = this.product3dContainerRef.createComponent(
        factory, 
        null, 
        this.injector
    );
  }
  
  outData(e){
    this.show360popupFlag = false;
    this.closePopup$.emit();
  }

  ngOnDestroy() {
    this.resetLazyComponent();
  }
  resetLazyComponent(){
    if(this.product3dInstance) {
      this.product3dInstance = null;
      this.product3dContainerRef.remove;
    }
  }
}

@NgModule({
  declarations: [ProductDescriptionComponent],
  imports: [ReactiveFormsModule,
    NumberDirectiveModule,
    MathFloorPipeModule,
    CommonModule,
    PopUpModule,
    ObserveVisibilityDirectiveModule
  ],
  exports: [ProductDescriptionComponent],
  
})

export default class ProductDescriptionModule {
}