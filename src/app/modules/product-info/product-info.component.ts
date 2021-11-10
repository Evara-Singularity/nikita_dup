import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
    selector: 'product-info',
    templateUrl: './product-info.component.html',
    styleUrls: ['./product-info.component.scss']
})
export class ProductInfoComponent implements OnInit, OnDestroy
{
    tabs: string[] = [];
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

    constructor() { }

    ngOnInit()
    {
        this.productInfo = this.modalData['productInfo'];
        delete this.modalData['productInfo'];
        this.tabs = Object.keys(this.modalData);
        this.hasVideos = this.tabs.includes("videos");
        this.innerWidth = window.innerWidth.toString();
        // this.totalInnerWIdth = window.innerWidth + 100;
    }

    updateTab(tab, index)
    {
        this.selectedIndex = index;
        this.defaultInfo = tab;
        this.shiftLeft = `translateX(${-this.innerWidth * index}px) `;
        // this.scrollTab(index - this.leftTabIdx - 1);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) { this.innerWidth = window.innerWidth; }

    closeProducInfo($event) { this.openProductInfo = false; this.closePopup$.emit(); }

    ngOnDestroy() { }

}
