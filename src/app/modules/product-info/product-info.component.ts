import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
    selector: 'product-info',
    templateUrl: './product-info.component.html',
    styleUrls: ['./product-info.component.scss']
})
export class ProductInfoComponent implements OnInit, OnDestroy
{
    tabs: string[] = [];;
    @Input('openProductInfo') openProductInfo = false;
    @Input('modalData') modalData = null;

    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    defaultInfo = "";

    constructor() { }

    ngOnInit() { this.tabs = Object.keys(this.modalData) }

    updateTab(tab) { this.defaultInfo = tab }

    closeProducInfo($event) { this.openProductInfo = false; this.closePopup$.emit(); }

    ngOnDestroy() { }

}
