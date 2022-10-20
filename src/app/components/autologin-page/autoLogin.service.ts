import { CONSTANTS } from '@app/config/constants';
import { Injectable } from "@angular/core";
import { DataService } from "@app/utils/services/data.service";
import { ENDPOINTS } from '@app/config/endpoints';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AutoLoginService {

  constructor(private _dataService: DataService, private _http: HttpClient,) {
  }
  

  getTokenAuthentication(postBody) { 
   return this._dataService.callRestful("POST", 'https://nodeapiqa.moglilabs.com/nodeApi/v2/createProductUrl/tokenAuthentication' ,  { body: postBody });
  }

  
}
