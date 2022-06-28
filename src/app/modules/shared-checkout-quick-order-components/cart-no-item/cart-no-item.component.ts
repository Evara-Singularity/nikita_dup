import { DataService } from '@utils/services/data.service';
import { NullTemplateVisitor } from '@angular/compiler';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CategoryData } from '@app/utils/models/categoryData';
import { CommonService } from '@app/utils/services/common.service';
import { CONSTANTS } from '@config/constants';
import { CartService } from '@services/cart.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { ENDPOINTS } from '@app/config/endpoints';

@Component({
    selector: 'cart-no-item',
    templateUrl: './cart-no-item.component.html',
    styleUrls: ['./cart-no-item.component.scss'],
})

export class CartNoItemComponent implements OnInit, OnDestroy
{

    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    flyOutData: CategoryData[] = [];
    flyOutDataSubscription: Subscription = null;

    constructor(public cartService: CartService, private _dataService: DataService) { }


    ngOnInit(): void
    {
        const FLYOUT_URL = environment.BASE_URL + ENDPOINTS.GET_FDK_HOME;
        this.flyOutDataSubscription = this._dataService.callRestful("GET", FLYOUT_URL).pipe(map((response: CategoryData[]) =>
        {
            if (response && response['data']) { return response['data']; }
            return [];
        })).subscribe((data) => this.flyOutData = data);
    }

    ngOnDestroy(): void
    {
        this.flyOutDataSubscription.unsubscribe()
    }
}