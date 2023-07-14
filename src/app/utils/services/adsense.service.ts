import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import CONSTANTS from '@app/config/constants';
import { ENDPOINTS } from '@app/config/endpoints';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Observable } from 'rxjs-compat';
import { BannerAdUnit, PromotedBrandAd, VideoAdUnit } from '../models/adsense.model';

@Injectable()
export class AdsenseService {

  readonly STATUS_RUNNING = 'RUNNING';

  constructor(
    private _dataService: DataService
  ) { }

  private _getAdsenseCall(categoryId: string, brandName: string = null,msn:string=null) {
    let url =
      CONSTANTS.NEW_MOGLIX_API +
      ENDPOINTS.ADSENSE +
      "?platform=PWA";
    url = (categoryId) ? (url + '&category=' + categoryId) : url;
    url = (brandName) ? (url + '&brand=' + brandName) : url;
    url = (msn) ? (url + '&msn=' + msn) : url;
    return this._dataService.callRestful("GET", url).pipe(
      catchError((res: HttpErrorResponse) => {
        return of({ active: false, httpStatus: res.status });
      })
    );
  }

  getAdsense(categoryId: string, brandName: string = null ,msn:string=null): Observable<any> {
    return this._getAdsenseCall(categoryId, brandName,msn).pipe(map(response => {
      if (response && response['status'] == true) {
        return this._mapResponse(response);
      } else {
        return null;
      }
    }))
  }

  private _mapResponse(response) {
    if (response && response['data'] && response['data']['status'] == this.STATUS_RUNNING) {
      const campaignData = response['data']
      const promotedBrandUnit = this._promotedBrandUnit(campaignData);
      const featuredProductUnit = this._mapfeaturedProductUnit(campaignData);
      const videoUnit = this._videoUnit(campaignData);
      const banners = this._bannerAdUnits(campaignData)
      // console.log('adsense data', { ...featuredProductUnit, ...promotedBrandUnit, ...videoUnit, ...banners });
      return { ...featuredProductUnit, ...promotedBrandUnit, ...videoUnit, ...banners };
    } else {
      // console.log('adsense data', 'status is not running');
      return null;
    }
  }

  private _mapfeaturedProductUnit(campaignData): { FEATURED_PRODUCT_ADS?: any } {
    if (
      campaignData['featuredProductUnit'] &&
      campaignData['featuredProductUnit']['msns'] &&
      campaignData['featuredProductUnit']['msns'].length > 0) {
      return { FEATURED_PRODUCT_ADS: campaignData['featuredProductUnit']['msns'] };
    }
    return {}
  }

  private _promotedBrandUnit(campaignData) {
    if (campaignData['promotedBrandUnit'] && campaignData['promotedBrandUnit']['banners'] && campaignData['promotedBrandUnit']['banners'].length > 0) {
      const PROMOTOTED_BRAND_ADS = (campaignData['promotedBrandUnit']['banners'] as PromotedBrandAd[]).map(ads => {
        return {
          id: ads['id'],
          pictureUrl: ads['pictureUrl'],
          landingPageUrl: ads['landingPageUrl'],
          categoryName: ads['categoryName'],
        } as PromotedBrandAd
      });
      return { PROMOTOTED_BRAND_ADS };
    }
    return {}
  }

  private _videoUnit(campaignData) {
    if (campaignData['videoUnit'] && campaignData['videoUnit']['banners'] && campaignData['videoUnit']['banners'].length > 0) {
      const VIDEOS_ADS = (campaignData['videoUnit']['banners'] as VideoAdUnit[]).map(ads => {
        return {
          id: ads['id'],
          externalVideoLink: ads['externalVideoLink'],
          videoName: ads['videoName'],
          videoUrl: ads['videoUrl']
        } as VideoAdUnit
      })
      return { VIDEOS_ADS };
    }
    return {}
  }

  private _bannerAdUnits(campaignData) {
    if (campaignData &&
      campaignData['bannerAdUnit'] &&
      campaignData['bannerAdUnit']['banners'] &&
      campaignData['bannerAdUnit']['banners'].length > 0
    ) {
      const BANNERS = {}
      const TOP_BANNERS = (campaignData['bannerAdUnit']['banners'] as BannerAdUnit[])
        .filter(ads => ads.bannerType.startsWith("TOP_BANNER_POSITION"))
        .map(ads => {
          return {
            bannerType: ads.bannerType,
            id: ads.id,
            landingPageUrl: ads.landingPageUrl,
            pictureUrl: ads.pictureUrl
          } as BannerAdUnit
        });
      if(TOP_BANNERS &&TOP_BANNERS.length > 0){
        BANNERS['TOP_BANNERS'] = TOP_BANNERS;
      }
      (campaignData['bannerAdUnit']['banners'] as BannerAdUnit[])
        .filter(ads => !ads.bannerType.startsWith("TOP_BANNER_POSITION"))
        .forEach((ads: BannerAdUnit) => {
          BANNERS[ads.bannerType] = {
            bannerType: ads.bannerType,
            id: ads.id,
            landingPageUrl: ads.landingPageUrl,
            pictureUrl: ads.pictureUrl
          } as BannerAdUnit
        });
      return BANNERS;
    }
    return {}
  }

}
