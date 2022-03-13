import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from '@app/utils/services/common.service';

@Component({
    selector: 'un-available-items',
    templateUrl: 'unAvailableItems.html',
    styleUrls: ['./unAvailableItems.scss'],
})

export class UnAvailableItemsComponent {

    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    @Input() data: any;
    @Input() user: {};
    @Input() showLink = true;
    globalConstants: {};
    isServer: boolean;
    isBrowser: boolean;
    private cDistroyed = new Subject();
    itemsList: [] = [];
    
    constructor(   
        public _commonService: CommonService     
    ) {
        this.isServer = _commonService.isServer;
        this.isBrowser = _commonService.isBrowser;
    };

    ngOnInit() {
        this.itemsList = this.data['items'];
        console.log(this.data['items']);
    }

    ngAfterViewInit() {

    }

    ngOnDestroy() {
        this.cDistroyed.next();
        this.cDistroyed.unsubscribe();
    }

    closeModal() {
        this.closePopup$.emit();
    }

    removeUnavailableItems(callback){
        this.closeModal();
        callback(this.itemsList);
    }
}
