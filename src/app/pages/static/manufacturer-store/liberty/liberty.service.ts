import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { DataService } from '@app/utils/services/data.service';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';

@Injectable()
export class LibertyService {
	constructor(private dataService: DataService) {}
	getManufacturerData(type): Observable<{}> {
		return this.dataService.callRestful(
			'GET',
			CONSTANTS.NEW_MOGLIX_API +
				ENDPOINTS.GET_MANUFACTURE_PAGE +
				type +
				'_m'
		);
	}
}
