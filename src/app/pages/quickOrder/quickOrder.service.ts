import { Injectable } from "@angular/core";

import CONSTANTS from "../../config/constants";
import { ENDPOINTS } from "../../config/endpoints";
import { DataService } from "../../utils/services/data.service";

@Injectable()
export class QuickOrderService {

    constructor(private _dataService: DataService) {

    }

    getProduct(product) {
        let params = { productId: product.productId };
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PRODUCT_INFO, { params: params });
    }

    updateCart(itemsList, cart) {
        let totalAmount: Number;
        let totalPayableAmount: Number;
        for (let item of itemsList) {
            if (totalAmount == undefined || totalPayableAmount == undefined) {
                totalAmount = item.amount;
                totalPayableAmount = item.totalPayableAmount;
            }
            else {
                totalAmount = Number(totalAmount) + Number(item.amount);
                totalPayableAmount = Number(totalPayableAmount) + Number(item.totalPayableAmount);
            }
        };
        cart.totalAmountWithTaxes = totalAmount;

        cart.totalPayableAmount = totalPayableAmount;

        return cart;
    }

    updateCartSession(sessionCart) {
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + "/cart/updateCart", { body: sessionCart });
    }
}