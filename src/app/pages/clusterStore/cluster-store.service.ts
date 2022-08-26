import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { DataService } from '@app/utils/services/data.service';

@Injectable()
export class ClusterStoreService {
	constructor(private _dataService: DataService,
		        private http: HttpClient,
		) {}

	getData(cType) {
		return this._dataService.callRestful(
			'GET',
			CONSTANTS.NEW_MOGLIX_API +
				CONSTANTS.GET_PARENT_CAT +
				cType +
				'_m'
		);
	}
}
