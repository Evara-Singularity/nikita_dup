import { Injectable } from '@angular/core';
import CONSTANTS from 'src/app/config/constants';
import { DataService } from 'src/app/utils/services/data.service';

@Injectable()
export class Covid19Service {

    constructor(private dataServcie: DataService) {
    }

    getSpecialData(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm661682"
        return this.dataServcie.callRestful("GET", url, options);
    }
}
