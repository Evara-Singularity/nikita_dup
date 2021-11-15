import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
    selector: 'product-info',
    templateUrl: './product-info.component.html',
    styleUrls: ['./product-info.component.scss']
})
export class ProductInfoComponent implements OnInit, OnDestroy
{
    @Input('openProductInfo') openProductInfo = false;
    @Input('modalData') modalData = null;
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    defaultInfo = "";
    selectedIndex = 0;
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
    productDiscount = 0;
    bulkPriceWithoutTax = 0;
    bulkDiscount = 0;
    imgURL = null;
    productName = "";
    brandName = "";
    productOutOfStock = false;
    loginStatus = "guest";
    pageName = null;

    constructor(private globalAnalyticService: GlobalAnalyticsService,
        public localStorageService: LocalStorageService,) { }

    ngOnInit()
    {
        if (this.modalData) {
            this.processMainInfo(this.modalData['mainInfo']);
            this.processContentInfo(this.modalData['contentInfo'], this.modalData['infoType']);
            this.analyticsInfo = this.modalData['analyticsInfo'];
            this.processContentInfo(this.modalData['contentInfo'], this.modalData['infoType']);
        }
        const user = this.localStorageService.retrieve('user');
        this.loginStatus = (user && user["authenticated"] == 'true') ? "registered user" : "guest";
    }

    processMainInfo(mainInfo)
    {
        this.productMrp = mainInfo['productMrp'];
        this.priceWithoutTax = mainInfo['priceWithoutTax'];
        this.productDiscount = mainInfo['productDiscount'];
        this.bulkPriceWithoutTax = mainInfo['bulkPriceWithoutTax'];
        this.bulkDiscount = mainInfo['bulkDiscount'];
        this.productOutOfStock = mainInfo['productOutOfStock'];
        this.imgURL = mainInfo['imgURL'];
        this.productName = mainInfo['productName'];
        this.brandName = mainInfo['brandName'];
    }

    processContentInfo(contentInfo, infoType)
    {
        this.contentInfo = contentInfo;
        this.tabs = Object.keys(contentInfo);
        this.selectedIndex = this.tabs.indexOf(infoType);
        this.updateTab(infoType, this.selectedIndex)
    }

    updateTab(tab: string, index )
    {
        this.selectedIndex = index;
        this.defaultInfo = tab;
        this.sendTracking(tab.toUpperCase());
    }

    sendTracking(subSection: string)
    {
        const PAGE = this.analyticsInfo['page'];
        PAGE['subSection'] = subSection;
        this.globalAnalyticService.sendAdobeCall({ page: PAGE, custData: this.analyticsInfo['custData'], order: this.analyticsInfo['order'] },"genericPageLoad");
    }

    closeProducInfo($event) { this.openProductInfo = false; this.closePopup$.emit(); }

    ngOnDestroy() { }

}
