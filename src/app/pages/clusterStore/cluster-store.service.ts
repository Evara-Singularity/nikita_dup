import { Injectable } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { DataService } from '@app/utils/services/data.service';

@Injectable()
export class ClusterStoreService {
	constructor(private _dataService: DataService) {}

	getData(cType) {
		return this._dataService.callRestful(
			'GET',
			CONSTANTS.NEW_MOGLIX_API +
				'/category/getparentcategoryjsonbody?requestType=' +
				cType +
				'_m'
		);
	}
}
