import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

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

    constructor() { }

    ngOnInit() { }

    updateTab(tab){this.defaultInfo = tab}

    close(event) { this.closePopup$.emit(); }

    closeProducInfo($event) { this.closePopup$.emit(); this.openProductInfo = false;}

    ngOnDestroy()
    {
    }

}
