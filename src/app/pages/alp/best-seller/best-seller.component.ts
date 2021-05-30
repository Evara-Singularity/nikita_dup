import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { PopUpComponent } from '@modules/popUp/pop-up.component';
import { CONSTANTS } from '@config/constants';

@Component({
    selector: 'best-seller',
    templateUrl: './best-seller.component.html',
    styleUrls: ['./best-seller.component.scss']
})
export class BestSellerComponent implements OnInit
{

    @Input('items') items: any[] = [];
    openPopup: boolean;
    @ViewChild(PopUpComponent) _popupComponent: PopUpComponent;
    @Input('titleName') titleName = '';
    defaultImage = CONSTANTS.IMAGE_BASE_URL+'assets/img/home_card.webp';


    constructor()
    {
        this.openPopup = false;
    }

    ngOnInit(): void
    {
    }

    outData(data)
    {
        // console.log(data);
        if (Object.keys(data).indexOf('hide') !== -1) {
            this.openPopup = !data.hide;
        }
    }

    customClose()
    {
        this._popupComponent.closePopup();
    }




}
