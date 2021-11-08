import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
    selector: 'product-info',
    templateUrl: './product-info.component.html',
    styleUrls: ['./product-info.component.scss']
})
export class ProductInfoComponent implements OnInit, OnDestroy
{
    readonly TABS = ["key features", "specifications", "videos", "product details", "images"]

    @Input('openProductInfo') openProductInfo = false;
    @Input('modalData') modalData = null;

    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    defaultInfo = "";
    selectedIndex = 0;
    leftTabIdx = 0;
    atStart = true;
    atEnd = false;
    shiftLeft:string;

    constructor() { }

    ngOnInit() { 
        this.shiftLeft = `translateX(0px)`;
    }

    updateTab(tab,index){
        this.selectedIndex = index;
        this.defaultInfo = tab;
        console.log(tab, this.selectedIndex);
        this.scrollTab(index - this.leftTabIdx - 1);

    }
    scrollTab(x){
        if ((this.atStart && x < 0) || (this.atEnd && x > 0)) {
            return;
          }
        this.leftTabIdx = this.leftTabIdx + x;
        this.shiftLeft = `translateX(${this.leftTabIdx * -140}px)`;
        this.atStart = this.leftTabIdx === 0;
        this.atEnd = this.leftTabIdx === this.TABS.length - 1
    }
    @HostListener('scroll', ['$event']) 
    scrollHandler(event) {
      console.debug("Scroll Event");
    }

    close(event) { this.closePopup$.emit(); }

    closeProducInfo($event) { this.closePopup$.emit(); this.openProductInfo = false;}

    ngOnDestroy()
    {
    }

}
