import { Component, EventEmitter, Output, Input } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import CONSTANTS from '@app/config/constants';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';

@Component({
    selector: 'app-select-customer-type',
    templateUrl: './select-customer-type.component.html',
    styleUrls: ['./select-customer-type.component.scss']
})
export class SelectCustomerTypeComponent {

    types: Array<{}>;
    sct: string; // sct: selected customer type
    stc: Array<{}>; // stc: selected trending categories
    @Input() tCategories: Array<{}>;
    spcp: boolean; // spcp: show prefered category popup
    @Output() outData$: EventEmitter<{}>;
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    chkbox: boolean;
    constructor(private _lss: LocalStorageService, private _tms: ToastMessageService) {
        this.outData$ = new EventEmitter();
        this.chkbox = false;
        this.sct = null;
        this.spcp = false;
        this.types = [
            {id: 1, name: 'INDIVIDUAL', flag: false, img: 'b/I/P/B/d/individual.svg'},
            {id: 2, name: 'WHOLESELLER OR RESELLER', flag: false, img: 'b/I/P/B/d/wholeseller.svg'},
            {id: 3, name: 'SELF EMPLOYED', flag: false, img: 'b/I/P/B/d/self-employed.svg'},
            {id: 4, name: 'MANUFACTURER', flag: false, img: 'b/I/P/B/d/manufacturer.svg'}
        ];
    }

    checkInputLimit() {
       const len = [].slice.call(document.querySelectorAll('[name="chkbox[]"]'))
        .filter(function(e) { return e.checked; }).length;
        // console.log(len);
        if (len === 5) {
            this.chkbox = true;
        } else {
            this.chkbox = false;
        }
    }

    dontShowAgain() {
        this._lss.store('tocd', {dsa: true});
    }
    addDataToStorage() {
        const tocd = {
            type: this.types[this.sct],
            data: this.getSelectedData(this.tCategories)
        };
        this._lss.store('tocd', tocd);
        this.outData$.emit({stocp: false, utcd: true});

        this._tms.show({type: 'success', text: 'Your homepage is now customized'});
    }

    getSelectedData(tCategories) {
        return tCategories.filter(tc => tc['checked']);
    }
}
