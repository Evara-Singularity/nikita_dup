import { Observable, of } from 'rxjs';
import { DOCUMENT } from "@angular/common";
import
    {
        Component,
        EventEmitter,
        HostListener,
        Inject,
        Input,
        OnDestroy,
        OnInit,
        Output,
    } from "@angular/core";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { ProductService } from "@app/utils/services/product.service";
import { NgxSiemaOptions, NgxSiemaService } from "ngx-siema";
import { LocalStorageService } from "ngx-webstorage";

@Component({
    selector: "product-info",
    templateUrl: "./product-info.component.html",
    styleUrls: ["./product-info.component.scss"],
})
export class ProductInfoComponent implements OnInit
{
  
    @Input("openProductInfo") openProductInfo = false;
    @Input("modalData") modalData = null;
    @Input("oosProductIndex") oosProductIndex = -1;
    @Input('analyticProduct') analyticProduct = null;
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
    bulkSellingPrice = 0;
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


    constructor(
        private globalAnalyticService: GlobalAnalyticsService,
        private _commonService: CommonService,
        public localStorageService: LocalStorageService,
        private _productService: ProductService,
        private ngxSiemaService: NgxSiemaService,
        @Inject(DOCUMENT) private _document,
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
        this.productPrice = mainInfo["productPrice"];
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
            this.siemaTab.style.height = `${this.slides[currentSlide].clientHeight+40}px`;
            
        }
    }
    callSpecification(event){
       setTimeout(() => {
        this.updateTabContentHeight(this.selectedIndex);
     }, 0);
    }
    
    moveTheSelectedIndex(selectedValue)
    {
        if (this._commonService.isBrowser) {
            let tabsId = document.getElementById("infoTabs");
            if (selectedValue > 1) {
                tabsId.scroll({
                    left: 330,
                    top: 0,
                    behavior: 'smooth'
                })
            }
            if (selectedValue <= 1) {
                tabsId.scroll({
                    left: 0,
                    top: 0,
                    behavior: 'smooth'
                })
            }
        }
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
}
