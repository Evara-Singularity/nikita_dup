import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import { CONSTANTS } from '@config/constants';
import { CartService } from '@services/cart.service';

@Component({
    selector: 'cart-no-item',
    templateUrl: './cart-no-item.component.html',
    styleUrls: ['./cart-no-item.component.scss'],
})

export class CartNoItemComponent implements OnInit{

    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;

    constructor(public cartService: CartService, private _commonService:CommonService){}

    ngOnInit(): void
    {
        this._commonService.getTrendingCategories().subscribe((data)=>console.log(data))
    }
}