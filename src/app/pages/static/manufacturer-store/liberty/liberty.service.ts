import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { DataService } from '@app/utils/services/data.service';
import CONSTANTS from '@app/config/constants';

@Injectable()
export class LibertyService {
	constructor(private dataService: DataService) {}
	getManufacturerData(type): Observable<{}> {
		return this.dataService.callRestful(
			'GET',
			CONSTANTS.NEW_MOGLIX_API +
				'/category/getManufacturePage?requestType=' +
				type +
				'_m'
		);
	}
}
