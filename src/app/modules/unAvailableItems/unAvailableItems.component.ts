import { Component, Input, EventEmitter, Output, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';

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
        @Inject(PLATFORM_ID) platformId,
    ) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
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
