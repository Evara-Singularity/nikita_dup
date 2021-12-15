import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductsEntity } from '../models/product.listing.search';
import { DataService } from './data.service';
const ERROR_RESPONSE = { data: null, status: false };

@Injectable({
    providedIn: 'root'
})
export class ProductBrowserService
{

    constructor(private _dataService: DataService, public http: HttpClient)
    { }

    getPastOrderProducts(userId)
    {
        const URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.GET_PAST_ORDERS}${userId}`;
        return this._dataService.callRestful("GET", URL).pipe(
            catchError((error: HttpErrorResponse) => { return of(ERROR_RESPONSE); })
        );
    }

    getRecentProducts(userId)
    {
        const URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.RECENTLY_VIEWED}${userId}`;
        return this._dataService.callRestful("GET", URL);
    }

    getSimilarProducts(productName, categoryId)
    {
        const URL = `${CONSTANTS.NEW_MOGLIX_API}${ENDPOINTS.SIMILAR_PRODUCTS}?str=${productName}&category=${categoryId}`;
        return this._dataService.callRestful('GET', URL).pipe(
            catchError((res: HttpErrorResponse) => { return of({ products: [], httpStatus: res.status }); })
        );
    }


    pastOrdersProductResponseToProductEntity(product: any)
    {

        const partNumber = product["msn"];
        const productMrp = product["mrp"];
        const productPrice = product["sellingPrice"];
        const priceWithoutTax = product["priceWithoutTax"];
        const img = product["productImage"] ? this.removeCDN(product["productImage"]) : "";
        return {
            moglixPartNumber: partNumber,
            moglixProductNo: product["moglixProductNo"] || null,
            mrp: productMrp,
            salesPrice: productPrice,
            priceWithoutTax: priceWithoutTax,
            productName: product["productName"],
            variantName: product["productName"],
            productUrl: product["url"],
            shortDesc: product["shortDesc"] || null,
            brandId: product["brandId"] || null,
            brandName: product["brandName"],
            quantityAvailable: 1,
            discount: (((productMrp - priceWithoutTax) / productMrp) * 100).toFixed(0),
            rating: product["rating"] || null,
            categoryCodes: null,
            taxonomy: product["taxonomy"] || null,
            mainImageLink: img,
            mainImageMediumLink: img,
            mainImageThumnailLink: img,
            productTags: [],
            filterableAttributes: {},
            avgRating: product.avgRating || 0,
            itemInPack: null,
            ratingCount: product.ratingCount || 0,
            reviewCount: product.reviewCount || 0,
            internalProduct: true,
            outOfStock: product.outOfStock,
        } as ProductsEntity;
    }

    removeCDN(image: string)
    {
        const cdn = "/p";
        const INDEX = image.indexOf(cdn);
        console.log(image, INDEX, image.substr(INDEX+1, image.length));
        if (INDEX > -1) { return image.substr(INDEX+1, image.length) }
        return image
    }
}
