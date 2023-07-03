import { Observable, of } from 'rxjs';
import { DOCUMENT } from "@angular/common";
import
    {
        ChangeDetectorRef,
        Component,
        ComponentFactoryResolver,
        EventEmitter,
        HostListener,
        Inject,
        Injector,
        Input,
        OnDestroy,
        OnInit,
        Output,
        ViewChild,
        ViewContainerRef,
    } from "@angular/core";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { ProductService } from "@app/utils/services/product.service";
import { NgxSiemaOptions, NgxSiemaService } from "ngx-siema";
import { LocalStorageService } from "ngx-webstorage";
import { LocalAuthService } from '@app/utils/services/auth.service';
import { Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';

@Component({
    selector: "product-info",
    templateUrl: "./product-info.component.html",
    styleUrls: ["./product-info.component.scss"],
})
export class ProductInfoComponent implements OnInit
{
    product3dInstance = null;
    @ViewChild("product3dContainerRef", { read: ViewContainerRef })
    product3dContainerRef: ViewContainerRef;
    productStaticData = this._commonService.defaultLocaleValue;
    @Input("openProductInfo") openProductInfo = false;
    @Input("modalData") modalData = null;
    @Input("oosProductIndex") oosProductIndex = -1;
    @Input('analyticProduct') analyticProduct = null;
    @Input() msnId;
    @Input() threeDImages = [];
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    defaultInfo = "";
    selectedIndex = 0;
    selectedTabIndex = 0;
    productInfo = null;
    //new code
    mainInfo = null;
    contentInfo = null;
    analyticsInfo = null;
    tab = null;
    tabs: string[] = [];
    //prices
    productMrp = 0;
    priceWithoutTax = 0;
    productPrice = 0;
    productDiscount = 0;
    bulkPriceWithoutTax = 0;
    bulkSellingPrice = null;
    bulkDiscount = 0;
    imgURL = null;
    productName = "";
    brandName = "";
    productOutOfStock = false;
    loginStatus = "guest";
    pageName = null;
    ngxSiemaOptions: NgxSiemaOptions = {
        selector: '.prod-info-siema',
        duration: 500,
        perPage: 1,
        startIndex: this.selectedIndex,
        draggable: true,
        threshold: 20,
        loop: false,
        onInit: () =>
        {
            window.scrollTo(window.scrollX, window.scrollY + 1);
            window.scrollTo(window.scrollX, window.scrollY - 1);
        },
        onChange: (index) =>
        {
            this.scrollInitialize();
        },
    }
    slides:HTMLCollection;
    siemaTab:HTMLDivElement;
    showHindiContent:boolean;
    open360Popup:boolean;
    showPocMsn:boolean = false;
    for3dPopup: boolean = false;


    constructor(
        private globalAnalyticService: GlobalAnalyticsService,
        public _commonService: CommonService,
        public localStorageService: LocalStorageService,
        private _productService: ProductService,
        private ngxSiemaService: NgxSiemaService,
        @Inject(DOCUMENT) private _document,
        private _localAuthService: LocalAuthService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private _componentFactoryResolver:ComponentFactoryResolver,
        private injector : Injector
    ) { }

    ngOnInit()
    {
        
        if (this.modalData) {
            this.analyticsInfo = this.modalData["analyticsInfo"];
            this.processMainInfo(this.modalData["mainInfo"]);
            this.processContentInfo(
                this.modalData["contentInfo"],
                this.modalData["infoType"]
            );
        }
        const user = this.localStorageService.retrieve("user");
        this.loginStatus =
            user && user["authenticated"] == "true" ? "registered user" : "guest";
        this.getStaticSubjectData();  
        this.get360poup();
    }
    getStaticSubjectData(){
        this._commonService.changeStaticJson.subscribe(staticJsonData => {
          this.productStaticData = staticJsonData;
        });
    }

    ngAfterViewInit()
    {
        this.slides = (this._document.getElementsByTagName("ngx-siema-slide") as HTMLCollection);
        this.siemaTab = (this._document.getElementById("siemaTabContent") as HTMLDivElement);
        if (this._commonService.isBrowser && this.selectedIndex) {
            this.moveTheSelectedIndex(this.selectedIndex);
            this.ngxSiemaService.goTo(this.selectedIndex);
            return;
        }
        this.updateTabContentHeight(this.selectedIndex);
    }

    processMainInfo(mainInfo)
    {
        this.productMrp = mainInfo["productMrp"];
        this.priceWithoutTax = mainInfo["priceWithoutTax"];
        this.productDiscount = mainInfo["productDiscount"];
        this.bulkPriceWithoutTax = mainInfo["bulkPriceWithoutTax"];
        this.bulkDiscount = mainInfo["bulkDiscount"];
        this.productOutOfStock = mainInfo["productOutOfStock"];
        this.imgURL = mainInfo["imgURL"];
        this.productName = mainInfo["productName"];
        this.brandName = mainInfo["brandName"];
        this.productPrice =this.analyticsInfo?.order?.price;
        this.bulkSellingPrice = mainInfo["bulkSellingPrice"];
    }

    processContentInfo(contentInfo, infoType)
    {
        this.contentInfo = contentInfo;
        this.tabs = Object.keys(contentInfo);
        this.selectedIndex = this.tabs.indexOf(infoType);
        this.updateTab(infoType, this.selectedIndex);
    }

    updateTab(tab: string, index)
    {
        this.selectedIndex = index;
        this.defaultInfo = tab;
        this.sendTracking(tab.toUpperCase());
    }

    scrollInitialize()
    {
        this.ngxSiemaService
            .currentSlide(this.ngxSiemaOptions.selector)
            .subscribe((data) =>
            {
                if (data && typeof data.currentSlide !== "undefined") {
                    this.selectedIndex = data.currentSlide;
                    this.moveTheSelectedIndex(this.selectedIndex);
                    this.updateTab(this.tabs[this.selectedIndex], this.selectedIndex);
                    this.updateTabContentHeight(this.selectedIndex);
                }
            });
    }

    updateTabContentHeight(currentSlide)
    {
        if(this.siemaTab && this.slides)
        {
            this.siemaTab.style.height = `${this.slides[currentSlide].clientHeight+30}px`;
            this.cdr.detectChanges();
            
        }
    }
    callSpecification(event){
       setTimeout(() => {
        this.updateTabContentHeight(this.selectedIndex);
     }, 0);
    }

    moveTheSelectedIndex(selectedValue)
    {
        // console.log("this is called");
        if (this._commonService.isBrowser) {
            let tabsId = document.getElementById("infoTabs");
            if (selectedValue > 1) {
                // console.log("slide if"+selectedValue,"selectedValue");
                tabsId.scroll({
                    left: 330,
                    top: 0,
                    behavior: 'smooth'
                })
            }
            if (selectedValue <= 1) {
                // console.log("slide else"+selectedValue,"selectedValue");
                tabsId.scroll({
                    left: 0,
                    top: 0,
                    behavior: 'smooth'
                })
            }
        }
        this.cdr.detectChanges();
    }

    sendTracking(subSection: string)
    {
        const page = this.analyticsInfo["page"];
        page["subSection"] = subSection;
        const order = this.analyticsInfo["order"];
        if (this.oosProductIndex > -1) {
            const obj = this._productService.getAdobeAnalyticsObjectData(this.oosProductIndex, 'pdp:oos:similar');
            obj.page.subSection = subSection;
            this.globalAnalyticService.sendAdobeCall(
                obj,
                "genericPageLoad"
            );
        } else {
            this.globalAnalyticService.sendAdobeCall(
                { page, custData: this._commonService.custDataTracking, order },
                "genericPageLoad"
            );
        }
    }

    closeProducInfo($event)
    {
        if(!this.open360Popup) {
            this.open360Popup = false;
            return;
        }
        this.openProductInfo = false;
        this.closePopup$.emit();
    }
    goTo(index, selector, tab: string)
    {
       
        this.ngxSiemaService.goTo(index, selector);
        this.updateTab(tab, index);
        this.moveTheSelectedIndex(this.selectedIndex);
    }
    displaySlide(slide: string) { return this.tabs.includes(slide) }

    

    openLoginPopUp() {
        this._localAuthService.setBackURLTitle(this.router.url, '');
        this._commonService.setInitaiteLoginPopUp();
    }
    get isHindiUrl() {
        return (this.router.url).toLowerCase().indexOf('/hi') !== -1
    }
    get360poup() {
        if (this.msnId.toLowerCase() === CONSTANTS.POC_MSN || (this.threeDImages && this.threeDImages.length)) {
            this.showPocMsn = true;
        }
        if(this.msnId.toLowerCase() === CONSTANTS.POC_MSN) {
            this.for3dPopup = false;
          } else {
            this.for3dPopup = true;
          }
        this._commonService.open360popup$.subscribe(val => {
            this.open360Popup = true;
            setTimeout(() => this.show360popup(), 100)
        });
    }

    show360popup() {
        if (this.showPocMsn && this.msnId.toLowerCase() === CONSTANTS.POC_MSN) {
            this.load360ViewComponent();
        } else {
            this.load360View();
        }
    }

    async load360View(){
          const { ProductThreeSixtyViewComponentV1 } = await import('../../components/product-three-sixty-view-v1/product-three-sixty-view-v1.component');
          const factory = this._componentFactoryResolver.resolveComponentFactory(ProductThreeSixtyViewComponentV1);
          this.product3dInstance = this.product3dContainerRef.createComponent(
            factory, 
            null, 
            this.injector
        );
        this.product3dInstance.instance['threeDImages'] = this.threeDImages || [];
      }

    async load360ViewComponent(){
        if(!this.product3dInstance){
            const { ProductThreeSixtyViewComponent } = await import('../../components/product-three-sixty-view/product-three-sixty-view.component');
            const factory = this._componentFactoryResolver.resolveComponentFactory(ProductThreeSixtyViewComponent);
            this.product3dInstance = this.product3dContainerRef.createComponent(
            factory, 
            null, 
            this.injector
            );
        } 
    }
    ngOnDestroy(){
        if(this.product3dInstance){
            this.product3dInstance = null;
            this.product3dContainerRef = null;
        }
    }
}
