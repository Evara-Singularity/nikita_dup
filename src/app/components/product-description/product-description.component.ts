import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, NgModule, OnInit, Output, ComponentFactoryResolver, ViewContainerRef, ViewChild, Injector, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
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
  for3dPopup = false;
  // show360CTA: boolean = false;
  
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
  @Input() threeDImages = [];
  @Output() checkCartQuantityAndUpdate$: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _tms: ToastMessageService,
    public _commonService:CommonService,
    private _componentFactoryResolver:ComponentFactoryResolver,
    private injector: Injector,
    private _cdr: ChangeDetectorRef
    ) {
   }

  ngOnInit(): void {
    if (this.msnId.toLowerCase() === CONSTANTS.POC_MSN || (this.threeDImages && this.threeDImages.length)) {
      this.showPocMsn = true;
    }
    if(this.msnId.toLowerCase() === CONSTANTS.POC_MSN) {
      this.for3dPopup = false;
    } else {
      this.for3dPopup = true;
    }
    console.log(this.for3dPopup);
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
  show360popup() {
    this.show360popupFlag = true;
    setTimeout(() => {
      if (this.showPocMsn && this.msnId.toLowerCase() === CONSTANTS.POC_MSN) {
        this.load360ViewComponent();
      } else {
        this.load360View();
      }
      this._cdr.detectChanges();
    }, 100)
  }

  async load360View(){
      const { ProductThreeSixtyViewComponentV1 } = await import('../product-three-sixty-view-v1/product-three-sixty-view-v1.component');
      const factory = this._componentFactoryResolver.resolveComponentFactory(ProductThreeSixtyViewComponentV1);
      this.product3dInstance = this.product3dContainerRef.createComponent(
        factory, 
        null, 
        this.injector
    );
    this.product3dInstance.instance['threeDImages'] = this.threeDImages || [];
    this._cdr.detectChanges();
  }

  async load360ViewComponent(){
    if(this.msnId.toLowerCase() === CONSTANTS.POC_MSN) {
        const { ProductThreeSixtyViewComponent } = await import('../product-three-sixty-view/product-three-sixty-view.component');
        const factory = this._componentFactoryResolver.resolveComponentFactory(ProductThreeSixtyViewComponent);
        this.product3dInstance = this.product3dContainerRef.createComponent(
          factory, 
          null, 
          this.injector
      );
    }
    this._cdr.detectChanges();
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
      this.product3dContainerRef = null;
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
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
  
})

export default class ProductDescriptionModule {
}