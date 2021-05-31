import {Injectable} from '@angular/core';
import {DataService} from '@services/data.service';
import {Observable} from 'rxjs/Observable';
import { CONSTANTS } from '@config/constants';
import { catchError } from 'rxjs/operators/catchError';
import { of } from 'rxjs/observable/of';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class AlpService {

    constructor(private _dataService: DataService) {


    }

    getRelatedCategories(categoryId): Observable<any> {
        const url = CONSTANTS.NEW_MOGLIX_API + '/category/getcategorybyid?catId=' + categoryId;
        return this._dataService.callRestful('GET', url)
        .pipe(
            catchError((res: HttpErrorResponse) => {
                return of({categoryDetails: {active: false}, httpStatus: res.status});
            })
        );
    }
    getCategoryExtraData(categoryId):Observable<any>{
        let url=CONSTANTS.NEW_MOGLIX_API+"/category/getcategoryExtras?requestType="+categoryId;
        return this._dataService.callRestful("GET",url);
    }
    getFaqApi(categoryId):Observable<any>
    {
        let url=CONSTANTS.NEW_MOGLIX_API+"/quest/getCategorySchema?categoryCode="+categoryId;
        return this._dataService.callRestful("GET",url);
    }

    getCIMSAttributeListingInfo(attribute: string)
    {
        return this._dataService.callRestful('GET', CONSTANTS.NEW_MOGLIX_API + '/cmsApi/getAttributesListingPage?friendlyUrl='  + attribute);
    }

    getGroupedProducts(products: any[], key:string, count:number)
    {
        let productCount = {};
        products.forEach((product) =>
        {
            let name = (product[key] as string).trim();
            if (productCount[name]  != undefined  && (productCount[name] as any[]).length < count) {
                productCount[name] = (productCount[name] as any[]).concat(product);
            }
             else if(productCount[name]  == undefined) {
                productCount[name] = [product];
            }
        });
        for(let key in productCount){
            if(productCount[key].length == 1){
                delete productCount[key];
            }
        }
        return productCount;
    }
}
