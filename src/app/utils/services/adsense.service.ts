import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Observable } from 'rxjs-compat';

@Injectable()
export class AdsenseService {

  readonly STATUS_RUNNING = 'RUNNING';
  readonly FEATURE_PRODUCT_KEY = 'featuredProductUnit';
  readonly BANNER_ADS_UNIT_KEY = 'bannerAdUnit';
  readonly PROMOTED_BRNAD_UNIT_KEY = 'promotedBrandUnit';
  readonly VIDEO_UINT_KEY

  constructor(
    private _dataService: DataService
  ) { }

  private _getAdsenseCall(categoryId: string, brandName: string = null) {
    let url =
      CONSTANTS.NEW_MOGLIX_API +
      ENDPOINTS.ADSENSE +
      "?platform=PWA&category=" +
      categoryId;
    url = (brandName) ? (url + '&brand = ' + brandName) : url;
    return this._dataService.callRestful("GET", url).pipe(
      catchError((res: HttpErrorResponse) => {
        return of({ active: false, httpStatus: res.status });
      })
    );
  }

  getAdsense(categoryId: string, brandName: string = null): Observable<any> {
    return this._getAdsenseCall(categoryId, brandName).pipe(map(response => {
      if (response && response['status'] == true) {
        return this._mapResponse(response);
      } else {
        return null;
      }
    }))
  }

  private _mapResponse(response) {
    if (response && response['data'] && response['data']['status'] == this.STATUS_RUNNING) {
      return {
        featuredProducts: this._mapfeaturedProductUnit(response),
        topBanners: this._bannerAdUnitUnit(response),
        promotedBrands: this._promotedBrandUnit(response),
        videos: this._videoUnit(response),
      };
    } else {
      console.log('adsense data', 'status is not running');
      return null;
    }
    return response;
  }

  private _mapfeaturedProductUnit(response) {
    return response;
  }

  private _bannerAdUnitUnit(response) {
    return response;
  }

  private _promotedBrandUnit(response) {
    return response;
  }

  private _videoUnit(response) {
    return response;
  }

}
