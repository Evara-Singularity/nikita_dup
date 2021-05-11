import { Injectable } from '@angular/core';
import CONSTANTS from 'src/app/config/constants';
import { DataService } from 'src/app/utils/services/data.service';

@Injectable()
export class CommonDealsService {

    constructor(private dataServcie: DataService) {}

    getDealsData(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm910070"
        return this.dataServcie.callRestful("GET", url, options);
    }

    getAmazingDealsData(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm557824"
        return this.dataServcie.callRestful("GET", url, options);
    }

    getBestDealData(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm504212"
        return this.dataServcie.callRestful("GET", url, options);
    }

    getBigDealData(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm571243"
        return this.dataServcie.callRestful("GET", url, options);
    }

    getBestOfferData(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm738195";
        return this.dataServcie.callRestful("GET", url, options);
    }

    getBrandData(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm566827";
        return this.dataServcie.callRestful("GET", url, options);
    }

    getSpecialData(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm661682"
        return this.dataServcie.callRestful("GET", url, options);
    }

    getFreshData(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm945780"
        return this.dataServcie.callRestful("GET", url, options);
    }

    getFreshData1(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm582807"
        return this.dataServcie.callRestful("GET", url, options);
    }

    getMadeInIndiaData(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm338747"
        return this.dataServcie.callRestful("GET", url, options);
    }

    getMonsoonSaleData(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm198139"
        return this.dataServcie.callRestful("GET", url, options);
    }

    getFreshData3(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm135389"
        return this.dataServcie.callRestful("GET", url, options);
    }

    getSeasonSaleData(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm693211"
        return this.dataServcie.callRestful("GET", url, options);
    }

    getSlipSafetyData(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm117308"
        return this.dataServcie.callRestful("GET", url, options);
    }

    getSpecialDealsData(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm411298"
        return this.dataServcie.callRestful("GET", url, options);
    }

    getSpecialData2(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm654033"
        return this.dataServcie.callRestful("GET", url, options);
    }

    getFreshData4(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm689366"
        return this.dataServcie.callRestful("GET", url, options);
    }

    getWinterData(options?: {}) {
        let url = CONSTANTS.NEW_MOGLIX_API + "/homepage/layoutbycode?id=cm483590"
        return this.dataServcie.callRestful("GET", url, options);
    }
}