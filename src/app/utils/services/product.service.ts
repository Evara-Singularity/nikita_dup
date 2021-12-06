import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { DataService } from './data.service';
import CONSTANTS from '../../config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { ProductsEntity } from '../models/product.listing.search';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private basePath = CONSTANTS.NEW_MOGLIX_API;

    constructor(private _dataService: DataService, public http: HttpClient) {
    }

    getPurchaseList(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PRC_LIST;
        return this._dataService.callRestful("GET", url, { params: data })
            .pipe(
                catchError((res: HttpErrorResponse) => {
                    return of({ status: false, statusCode: res.status, data: [] });
                })
            );
    }

    addToPurchaseList(obj) {
        let url = this.basePath + ENDPOINTS.ADD_PURCHASE_LIST;
        return this._dataService.callRestful("POST", url, { body: obj });
    }

    removePurchaseList(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.RM_PCR_LIST;
        return this._dataService.callRestful("POST", url, { body: data });
    }

    getFBTProducts(msn) {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PRODUCT_FBT + '?productId=' + msn);
    }

    getSimilarProducts(productName, categoryId) {
        const URL = this.basePath + ENDPOINTS.SIMILAR_PRODUCTS +'?str=' + productName + '&category=' + categoryId;
        return this._dataService.callRestful('GET', URL)
            .pipe(
                catchError((res: HttpErrorResponse) => {
                    return of({ products: [], httpStatus: res.status });
                })
            );
    }

    getrecentProduct(user_id) {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.RECENTLY_VIEWED + user_id);
    }

    getGSTINDetails(gstin) {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.TAXPAYER_BY_TIN + gstin);
    }

    postBulkEnquiry(obj) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/rfq/createRfq";
        return this._dataService.callRestful("POST", url, { body: obj })
    }

    getStateCityByPinCode(pinCode) {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.CITY_BY_PIN + pinCode);
    }

    getLogisticAvailability(data) {
        let url = CONSTANTS.NEW_MOGLIX_API + '/logistics/getProductLogistics';
        return this._dataService.callRestful("POST", url, { body: data });
    }

    getAllOffers() {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CategoryExtras + "mobikwikpdp");
    }

    getEmiPlans(price) {
        let url = this.basePath + ENDPOINTS.GET_EMI_VAL + "?price=" + price;
        return this._dataService.callRestful("GET", url);
    }


    getGroupProductObj(productID) {
        const url = this.basePath + ENDPOINTS.PRODUCT_INFO + '?productId=' + productID + '&fetchGroup=true';
        return this._dataService.callRestful('GET', url)
            .pipe(
                catchError((res: HttpErrorResponse) => {
                    return of({ active: false, httpStatus: res.status });
                })
            );
    }

    postReview(obj) {
        const url = this.basePath + ENDPOINTS.SET_REVIEWS;
        return this._dataService.callRestful('POST', url, { body: obj })
            .pipe(
                catchError((res: HttpErrorResponse) => {
                    return of({ data: [], code: res.status });
                })
            );
    }

    postHelpful(obj) {
        const url = this.basePath + ENDPOINTS.IS_REVIEW_HELPFUL;
        return this._dataService.callRestful('POST', url, { body: obj })
            .pipe(
                catchError((res: HttpErrorResponse) => {
                    return of({ data: [], code: res.status });
                })
            );
    }

    postQuestion(obj) {
        let url = this.basePath + ENDPOINTS.SET_QUEST;
        return this._dataService.callRestful("POST", url, { body: obj });
    }

    getRecentlyBoughtProducts(msn) {
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.PRODUCT_STATUS_COUNT + "?timeInterval=10&productId=" + msn);
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
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_SESSION);
    }

    getCartBySession(params) {
        return this._dataService.callRestful("GET", this.basePath + ENDPOINTS.GET_CartBySession, { params: params });
    }

    getSponseredProducts(params){
        return this._dataService.callRestful("GET", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.SPONSERED_PRODUCTS, { params: params });
    }



}
