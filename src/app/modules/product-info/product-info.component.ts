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
    atStart = true;
    atEnd = false;
    shiftLeft: string;
    productInfo = null;
    public innerWidth: any;
    public totalInnerWIdth;
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
        this.innerWidth = window.innerWidth.toString();
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
    updateTab(tab, index)
    {
        this.selectedIndex = index;
        this.defaultInfo = tab;
        this.shiftLeft = `translateX(${-this.innerWidth * index}px)`;
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) { this.innerWidth = window.innerWidth; }

    hasTab(tabName) { return this.tabs.includes(tabName); }

    closeProducInfo($event) { this.openProductInfo = false; this.closePopup$.emit(); }

    ngOnDestroy() {}
}
