import { Injectable } from '@angular/core';
declare var dataLayer;
declare var digitalData: {};
declare var _satellite;


@Injectable({
  providedIn: 'root'
})
export class SharedOtpUtilService {

  constructor() { }

    sendAdobeAnalysis()
    {
        let page = {
            'pageName': "moglix:login page",
            'channel': "login/signup",
            'subSection': "moglix:login page:otp details",
        }
        digitalData["page"] = page;
        if(_satellite){
            _satellite.track("genericPageLoad");
        }
    }

    sendCheckoutAdobeAnalysis()
    {
        let page = {
            'pageName': "moglix:order checkout:login page",
            'channel': "checkout",
            'subSection': "moglix:order checkout:login page:otp details",
        }
        digitalData["page"] = page;
        if(_satellite){
            _satellite.track("genericPageLoad");
        }
    }

    sendCriteoLayerTags(data)
    {
        dataLayer.push({
            'event': 'setEmail',
            'PageType': 'OtpPage',
            'email': data['email'] ? data['email'] : data['phone']
        });
        dataLayer.push({
            'event': 'user_login',
            id: data["userId"],
            first_name: data["userName"],
            last_name: '',
            phone: data["phone"],
            email: data["email"],
            user_type: data["userType"]
        });
    }
}
