import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import CONSTANTS from '@app/config/constants';
import { DataService } from '@app/utils/services/data.service';
import { ENDPOINTS } from '@app/config/endpoints';
@Injectable({
	providedIn: 'root',
})
export class ViewService {
	constructor(private http: HttpClient, private dataService: DataService) {}

	// get all categories data from the api
	getCategoriesData() {
		return this.dataService.callRestful(
			'GET',
			CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_ALL_CAT
		);
	}

	getClustorCategoryApi() {
		return this.http.get(
			CONSTANTS.NEW_MOGLIX_API +
			CONSTANTS.GET_PARENT_CAT+'all-categories-mobile'
		);
	}
}
