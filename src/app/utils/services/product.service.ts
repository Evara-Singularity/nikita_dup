import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { DataService } from './data.service';
import CONSTANTS from '../../config/constants';
import { ENDPOINTS } from 'src/app/config/endpoints';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private basePath = CONSTANTS.NEW_MOGLIX_API;

    constructor(private _dataService: DataService, public http: HttpClient) {
    }

    getPurchaseList(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/purchase/getPurchaseList";
        return this._dataService.callRestful("GET", url, { params: data })
            .pipe(
                catchError((res: HttpErrorResponse) => {
                    return of({ status: false, statusCode: res.status, data: [] });
                })
            );
    }

    addToPurchaseList(obj) {
        let url = this.basePath + "/purchase/addPurchaseList";
        return this._dataService.callRestful("POST", url, { body: obj });
    }

    removePurchaseList(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/purchase/removePurchaseList";
        return this._dataService.callRestful("POST", url, { body: data });
    }

    getFBTProducts(msn) {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + '/product/getProductFbtDetails?productId=' + msn);
    }

    getSimilarProducts(productName, categoryId) {
        const URL = this.basePath + '/search/similarproducts?str=' + productName + '&category=' + categoryId;
        return this._dataService.callRestful('GET', URL)
            .pipe(
                catchError((res: HttpErrorResponse) => {
                    return of({ products: [], httpStatus: res.status });
                })
            );
    }

    getrecentProduct(user_id) {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/recentlyviewed/getRecentlyViewd?customerId=" + user_id);
    }

    getGSTINDetails(gstin) {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/address/getTaxpayerByGstin?gstin=" + gstin);
    }

    postBulkEnquiry(obj) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/rfq/createRfq";
        return this._dataService.callRestful("POST", url, { body: obj })
    }

    getStateCityByPinCode(pinCode) {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/address/getcitystatebyPincode?pin=" + pinCode);
    }

    getLogisticAvailability(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + '/logistics/getProductLogistics';
        return this._dataService.callRestful("POST", url, { body: data });
    }

    getAllOffers() {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/category/getcategoryExtras?requestType=mobikwikpdp");
    }

    getEmiPlans(price) {
        let url = this.basePath + "/payment/getEMIValues?price=" + price;
        return this._dataService.callRestful("GET", url);
    }


    getGroupProductObj(productID) {
        const url = this.basePath + '/product/getProductGroup?productId=' + productID + '&fetchGroup=true';
        return this._dataService.callRestful('GET', url)
            .pipe(
                catchError((res: HttpErrorResponse) => {
                    return of({ active: false, httpStatus: res.status });
                })
            );
    }

    postReview(obj) {
        const url = this.basePath + '/reviews/setReviews';
        return this._dataService.callRestful('POST', url, { body: obj })
            .pipe(
                catchError((res: HttpErrorResponse) => {
                    return of({ data: [], code: res.status });
                })
            );
    }

    postHelpful(obj) {
        const url = this.basePath + '/reviews/isReviewHelpful';
        return this._dataService.callRestful('POST', url, { body: obj })
            .pipe(
                catchError((res: HttpErrorResponse) => {
                    return of({ data: [], code: res.status });
                })
            );
    }

    postQuestion(obj) {
        let url = this.basePath + "/quest/setQuest";
        return this._dataService.callRestful("POST", url, { body: obj });
    }

    getRecentlyBoughtProducts(msn) {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/cmsApi/productStatusCount?timeInterval=10&productId=" + msn);
    }

    getReviewsRating(obj) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PRODUCT_REVIEW;
        return this._dataService.callRestful('POST', url, { body: obj })
            .pipe(
                catchError((res: HttpErrorResponse) => {
                    return of({ data: null, httpStatus: res.status });
                })
            );
    }

    getQuestionsAnswers(productId: string) {
        const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.Q_AND_A + "?itemId=" + productId.toUpperCase();
        return this._dataService.callRestful('GET', url)
            .pipe(
                catchError((res: HttpErrorResponse) => {
                    return of({ data: [], statusCode: res.status });
                })
            );
    }

    getSession() {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + "/session/getSession");
    }

    getCartBySession(params) {
         return this._dataService.callRestful("GET", this.basePath + "/cart/getCartBySession", { params: params });
    }
}
