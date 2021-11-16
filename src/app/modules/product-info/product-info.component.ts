import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';

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
    leftTabIdx = 0;
    productInfo = null;
    hasVideos = false;

    //new code
    mainInfo = null;
    contentInfo = null;
    tab = null;
    tabs: string[] = [];
    //prices
    productMrp = 0;
    priceWithoutTax = 0;
    productDiscount = 0;
    bulkPriceWithoutTax = 0;
    bulkDiscount = 0;
    productOutOfStock = false;
    imgURL = null;
    productName = "";
    brandName = "";


    constructor() {}

    ngOnInit()
    {
        if (this.modalData) {
            this.processMainInfo(this.modalData['mainInfo']);
            this.processContentInfo(this.modalData['contentInfo'], this.modalData['infoType']);
        }
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
        this.updateTab(infoType,this.selectedIndex)
    }
    updateTab(tab,index)
    {
        this.selectedIndex = index;
        this.defaultInfo = tab;
        let infoTabs = document.getElementById('infoTabs');
        if(infoTabs){
            console.clear();
            console.log(" infoTabs.scrollLeft", infoTabs.scrollLeft);
            infoTabs.scrollLeft += (80 * index);
        }
    }
    hasTab(tabName) { return this.tabs.includes(tabName); }

    closeProducInfo($event) { this.openProductInfo = false; this.closePopup$.emit(); }

    ngOnDestroy() {}
}
