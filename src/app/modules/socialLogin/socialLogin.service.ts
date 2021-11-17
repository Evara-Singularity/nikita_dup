import { Injectable } from "@angular/core";
import CONSTANTS from "@app/config/constants";
import { DataService } from "../../utils/services/data.service";

@Injectable()
export class SocialLoginService {
    constructor(private _dataService: DataService) {

    }

    getNativeWindow() {
        return window;
    }

    login(name) {

        let socialUrl;
        if (name == 'google')
            socialUrl = CONSTANTS.NEW_MOGLIX_API + '/googlelogin/';

        if (socialUrl == undefined)
            return;

        this._dataService.callRestful('GET', socialUrl).subscribe((response) => {

        });
    }

    public auth(provider: string, authConfig: any): void {

        if (provider == "linkedin") {
            window.location.href = CONSTANTS.SL.LINKEDIN_OAUTH + authConfig.linkedin.clientId + '&redirect_uri=' + authConfig.linkedin.redirectURI + '&response_type=code';
        }
        if (provider == "facebook") {
            window.location.href = CONSTANTS.SL.FB_OAUTH + authConfig.facebook.clientId + '&redirect_uri=' + authConfig.facebook.redirectURI + '&scope=email';
        }
        if (provider == "google") {
            window.location.href = CONSTANTS.SL.GOOGLE_OAUTH + authConfig.google.clientId + '&redirect_uri=' + authConfig.google.redirectURI + '&scope=email%20profile';
        }
    }

    authenticate(params) {
        params['device'] = CONSTANTS.DEVICE.device;
        let curl = CONSTANTS.NEW_MOGLIX_API + CONSTANTS.SL.API;
        return this._dataService.callRestful("POST", curl, { body: params });
    }
}