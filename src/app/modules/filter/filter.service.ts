import { Injectable, EventEmitter } from "@angular/core";
import { DataService } from 'src/app/utils/services/data.service';

@Injectable()
export class FilterService {
    public refreshProducts$ = new EventEmitter();

    constructor(private _dataService: DataService) { }
    getRecentlyViewedData(type, curl) {
        return this._dataService.callRestful('GET', curl);
    }
}