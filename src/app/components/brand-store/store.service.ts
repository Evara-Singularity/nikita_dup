import { Injectable } from '@angular/core';
import CONSTANTS from 'src/app/config/constants';
import { DataService } from '../../utils/services/data.service';


@Injectable()
export class StoreService {
    constructor(private dataServcie: DataService) {
    }

    getStoreData(id, options?:{}){
        let url=CONSTANTS.NEW_MOGLIX_API+"/homepage/layoutbycode?id=" + id;
        return this.dataServcie.callRestful("GET", url, options);
    }
}
