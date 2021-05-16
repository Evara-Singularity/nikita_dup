import {Injectable, EventEmitter} from "@angular/core";
import {DataService} from "@services/data.service";
import {CONSTANTS} from "@config/constants";

@Injectable({
    providedIn: 'root' 
})
export class SubCategoryService{
    public updateSubCategoryData$ = new EventEmitter();
    public refreshSubCategoryData$ = new EventEmitter();
    constructor(private _dataService: DataService){

    }

    private  getSubCategoryData(type, curl, params){
        return this._dataService.callRestful(type, curl, params);
    }

    refreshSubCategoryData(params){
        this.getSubCategoryData('GET', CONSTANTS.NEW_MOGLIX_API+'/category/getcategorybyid', params).subscribe((response) => {
            this.updateSubCategoryData$.emit(response);
        });
    }

}