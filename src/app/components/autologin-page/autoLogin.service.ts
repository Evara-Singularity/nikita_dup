import { CONSTANTS } from '@app/config/constants';
import { Injectable } from "@angular/core";
import { DataService } from "@app/utils/services/data.service";
import { ENDPOINTS } from '@app/config/endpoints';

@Injectable()
export class AutoLoginService {

  constructor(private _dataService: DataService) {
  }
  
  getTokenAuthentication(postBody) { 
   const url = CONSTANTS.NEW_MOGLIX_API_V2 + ENDPOINTS.TOKEN_AUTHENTICATION;
   return this._dataService.callRestful("POST", url ,  { body: postBody });
  }

  
}
