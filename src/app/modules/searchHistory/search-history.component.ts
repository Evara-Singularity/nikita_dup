import { Component, Output, EventEmitter } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Router } from '@angular/router';
import CONSTANTS from '@app/config/constants';

@Component({
    selector: 'app-search-history',
    templateUrl: './search-history.component.html',
    styleUrls: ['./search-history.component.scss']
})
export class SearchHistoryComponent {

    shd: Array<{name: string, link: string}>;
    @Output() outData$: EventEmitter<any> = new EventEmitter<any>();
    @Output() sendTextToSearchBar: EventEmitter<any> = new EventEmitter<any>();
    readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;

    constructor(private _r: Router, private _lss: LocalStorageService) {
        this.shd = this._lss.retrieve('search-history') ? this._lss.retrieve('search-history') : [];
    }

    /**
     * csh : Clear Search History
     * This function is used to clear search history from localstorage.
     */
    csh() {
        this._lss.clear('search-history');
        this.shd = [];
    }

    navigateTo(extras){
        this.outData$.emit('resetAll');
        this._r.navigate(['search'], extras);
    }

    addToSearchBar(e, name) {
        e.preventDefault();
        e.stopPropagation();
        this.sendTextToSearchBar.emit(name);
    }
}
