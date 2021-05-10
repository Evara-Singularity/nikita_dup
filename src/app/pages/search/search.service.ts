import {Injectable} from "@angular/core";
import {DataService} from "@app/utils/services/data.service";

@Injectable()
export class SearchService{

    constructor(private _dataService: DataService){

    }
}