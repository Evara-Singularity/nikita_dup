import { Injectable } from '@angular/core';
declare var dataLayer;
declare var digitalData: {};
declare var _satellite;

@Injectable({
  providedIn: 'root'
})
export class SharedLoginUtilService {

  sendLoginAdobeAnalysis() {
    let page = {
      'pageName': "moglix:login page",
      'channel': "login/signup",
      'subSection': "moglix:login page",
    }
    digitalData["page"] = page;
    if(_satellite){
      _satellite.track("genericPageLoad");
    }
  }

    sendSignupAdobeAnalysis()
    {
        let page = {
            'pageName': "moglix:signup form",
            'channel': "login/signup",
            'subSection': "moglix:signup form",
        }
        digitalData["page"] = page;
        if(_satellite){
          _satellite.track("genericPageLoad");
        }
    }

  sendCriteoLayerTags(data) {
    dataLayer.push({
      'event': 'setEmail',
      'PageType': 'LoginPage',
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

  validatePhone(value: string) {
    return /^[1-9][0-9]{9}$/.test(value) && !(value.startsWith('0'));
  }

}
