import { CommonService } from '@app/utils/services/common.service';
import { ProductService } from '@app/utils/services/product.service';
import { Component, ComponentFactoryResolver, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild, ViewContainerRef, AfterViewInit, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

@Component({
  selector: 'shared-product-carousel',
  templateUrl: './shared-product-carousel.component.html',
  styleUrls: ['./shared-product-carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SharedProductCarouselComponent implements OnInit, AfterViewInit
{
  productStaticData = this.commonService.defaultLocaleValue;
  whatsappUrl=CONSTANTS.whatsAppBannerUrl
  @Input('productAllImages') productAllImages;
  @Input('carouselInitialized') carouselInitialized = false;
  @Input('isPurcahseListProduct') isPurcahseListProduct;
  @Input('productOutOfStock') productOutOfStock;
  @Input('imagePathAsset') imagePathAsset;
  @Input('isProductCrouselLoaded') isProductCrouselLoaded = false;
  @Input('iOptions') iOptions;
  @Input('productTags') productTags;
  @Input('productName') productName;
  @Input('rawProductData') rawProductData;
  @Input('moveToSlide$') moveToSlide$: Subject<number>;
  @Input('refreshSiemaItems$') refreshSiemaItems$:  Subject<{ items: Array<{}>; type: string; currentSlide: number; } >;
  @Input('isAcceptLanguage') isAcceptLanguage:boolean = false;
  @Output() loadProductShare$: EventEmitter<any> = new EventEmitter<any>();
  @Output() addToPurchaseList$: EventEmitter<any> = new EventEmitter<any>();
  @Output() scrollToId$: EventEmitter<any> = new EventEmitter<any>();
  @Output() openPopUpcrousel$: EventEmitter<any> = new EventEmitter<any>();
  @Output() loadProductCrousel$: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendProductImageClickTracking$: EventEmitter<any> = new EventEmitter<any>();
  @Output() translate$: EventEmitter<any> = new EventEmitter<any>();
  @Input('productBo') productBo: any;
  productCrouselInstance = null;
  @ViewChild("productCrousel", { read: ViewContainerRef })
  productCrouselContainerRef: ViewContainerRef;
  @ViewChild("productCrouselPseudo", { read: ElementRef })
  productCrouselPseudoContainerRef: ElementRef;
  showPocMsn: boolean = false;
  selectLangaugeInstance = null;
  @ViewChild("selectLangauge", { read: ViewContainerRef })
  selectLangaugeContainerRef: ViewContainerRef;

  constructor(
    private cfr: ComponentFactoryResolver, 
    private injector: Injector, public productService: ProductService, 
    private router: Router,
    private commonService: CommonService,
    private _activatedRoute:ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private _commonService:CommonService,
    private _analyticsService:GlobalAnalyticsService
    ) { }

  ngOnInit(): void {
    // console.log(this.productBo,"this.productBo");
    this.productStaticData = this.commonService.getLocalizationData(!this.isHindiUrl);
    this.commonService.similarProductsLoaded.subscribe(value => value && this.cdr.detectChanges())
    if (this.rawProductData && this.rawProductData.defaultPartNumber.toLowerCase() === CONSTANTS.POC_MSN || (this.rawProductData.product3dImages && this.rawProductData.product3dImages.length)) {
      this.showPocMsn = true;
    }
    this._commonService.isProductCrouselLoaded.next(true)
    // this.getStaticSubjectData();
  }

  getStaticSubjectData() {
    this.commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
    });
  }

  ngAfterViewInit(): void
  {
  }
  async loadProductCrousel(slideIndex)
  {
    if (!this.productCrouselInstance) {
      this.isProductCrouselLoaded = true;
      const { ProductCrouselComponent } = await import(
        "../../modules/product-crousel/ProductCrousel.component"
      ).finally(() =>
      {
        this.clearPseudoImageCrousel();
      });
      const factory = this.cfr.resolveComponentFactory(ProductCrouselComponent);
      this.productCrouselInstance =
        this.productCrouselContainerRef.createComponent(
          factory,
          null,
          this.injector
        );
      this.productCrouselInstance.instance["options"] = this.iOptions;
      this.productCrouselInstance.instance["items"] = this.productAllImages;
      this.productCrouselInstance.instance["productBo"] = this.rawProductData;
      this.productCrouselInstance.instance["moveToSlide$"] = this.moveToSlide$;
      this.productCrouselInstance.instance["refreshSiemaItems$"] = this.refreshSiemaItems$;
      this.productCrouselInstance.instance["productName"] = this.productName;
      this.productCrouselInstance.instance["productOutOfStock"] = this.productOutOfStock;
      setTimeout(() =>
      {
        (this.productCrouselInstance.instance["moveToSlide$"] as Subject<number>).next(slideIndex);
      }, 100);
    } else {
      this.productCrouselInstance.instance["productOutOfStock"] = this.productOutOfStock;
    }
    this.cdr.detectChanges();
  }

  clearPseudoImageCrousel()
  {
    this.isProductCrouselLoaded = false;
    this.productCrouselPseudoContainerRef.nativeElement.remove();
  }

  onRotatePrevious()
  {
    this.loadProductCrousel(this.productAllImages.length - 1);
  }

  onRotateNext()
  {
    this.loadProductCrousel(1);
  }

  loadProductShare()
  {
    this.loadProductShare$.emit();
  }

  addToPurchaseList()
  {
    this.addToPurchaseList$.emit();
  }

  scrollToId(type: string)
  {
    this.scrollToId$.emit(type);
  }

  sendProductImageClickTracking()
  {
    this.openPopUpcrousel$.emit();
    this.sendProductImageClickTracking$.emit();
    // this.createFragment();
  }

  createFragment(){
    this._activatedRoute.fragment.subscribe((fragment: string)=>{
      if(this._activatedRoute.snapshot.fragment == CONSTANTS.PDP_IMAGE_HASH){
        return;
      }
      else{
        window.history.replaceState({}, '',`${this.router.url}/#${CONSTANTS.PDP_IMAGE_HASH}`);
        window.history.pushState({}, '',`${this.router.url}/#${CONSTANTS.PDP_IMAGE_HASH}`);
      }
    })
  }
  translate(){
    this.translate$.emit();
  }

  get isHindiUrl() {
    return (this.router.url).toLowerCase().indexOf('/hi') !== -1
  }
  open36popup(){
    this._commonService.open360popup$.next(true);
    this.setAdobeDataTracking();
  }

   setAdobeDataTracking(){
      this._analyticsService.sendAdobeCall(
        { channel: 'pdp', 
          pageName: this.showPocMsn ? 'moglix:pdp:360_poc_2':'moglix:pdp:360_poc_1',
          linkName:  "moglix:" + this.router.url
        }, 
        "genericClick")
    
  }

  pageTranslation(){
    const isPopUp = sessionStorage.getItem("isPopUp");
    if(isPopUp == null && !this.isHindiUrl){
      this.loadSelectLanguagePopUp();
    }else{
      this.translate();
    }
  }

  async loadSelectLanguagePopUp() {
      const { SelectLanguageComponent } = await import('../../components/select-language/select-language.component');
      const factory = this.cfr.resolveComponentFactory(SelectLanguageComponent);
      this.selectLangaugeInstance = this.selectLangaugeContainerRef.createComponent(
        factory,
        null,
        this.injector
      );
      this.selectLangaugeInstance.instance["isHindiUrl"] = this.isHindiUrl;
       // translate Event Handler
      (
        this.selectLangaugeInstance.instance[
        "translate$"
        ] as EventEmitter<any>
    ).subscribe((data) =>
    {
        this.translate();
    });
  }
   
   ngOnDestroy(){
    this._commonService.isProductCrouselLoaded.next(false);
   }
}
