import { Injectable } from "@angular/core";
import CONSTANTS from "src/app/config/constants";
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
            window.location.href = 'https://www.linkedin.com/oauth/v2/authorization?client_id=' + authConfig.linkedin.clientId + '&redirect_uri=' + authConfig.linkedin.redirectURI + '&response_type=code';
        }
        if (provider == "facebook") {
            window.location.href = 'https://www.facebook.com/v2.8/dialog/oauth?client_id=' + authConfig.facebook.clientId + '&redirect_uri=' + authConfig.facebook.redirectURI + '&scope=email';
        }
        if (provider == "google") {
            window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=' + authConfig.google.clientId + '&redirect_uri=' + authConfig.google.redirectURI + '&scope=email%20profile';
        }
    }

    authenticate(params) {
        let curl = CONSTANTS.NEW_MOGLIX_API + "/login/sociallogin";
        return this._dataService.callRestful("POST", curl, { body: params });
    }
}