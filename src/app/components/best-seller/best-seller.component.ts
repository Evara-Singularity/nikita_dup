import { Component, OnInit, Input } from '@angular/core';
import CONSTANTS from 'src/app/config/constants';

@Component({
    selector: 'best-seller',
    templateUrl: './best-seller.component.html',
    styleUrls: ['./best-seller.component.scss']
})
export class BestSellerComponent implements OnInit {

    @Input('items') items: any[] = [];
    openPopup: boolean;
    viewAll: any;
    @Input('titleName') titleName = '';
    defaultImage = CONSTANTS.IMAGE_BASE_URL + 'assets/img/home_card.webp';

    constructor() {
        this.openPopup = false;
    }

    ngOnInit(): void {
    }

    outData(data) {
        if (Object.keys(data).indexOf('hide') !== -1) {
            this.openPopup = !data.hide;
        }
    }
}