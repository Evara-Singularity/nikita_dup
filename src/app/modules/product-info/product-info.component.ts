import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
    selector: 'product-info',
    templateUrl: './product-info.component.html',
    styleUrls: ['./product-info.component.scss']
})
export class ProductInfoComponent implements OnInit, OnDestroy
{
    readonly TABS = ["key features", "specifications", "videos", "product details", "images"]


    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    @Input('modalData') modalData = null;
    private cDistryoyed = new Subject();
    defaultInfo = "";

    constructor() { }

    ngOnInit() { }

    updateTab(tab){this.defaultInfo = tab}

    close() { this.closePopup$.emit(); }

    ngOnDestroy()
    {
        this.cDistryoyed.next();
        this.cDistryoyed.unsubscribe();
    }

}
