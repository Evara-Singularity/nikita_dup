import { Injectable } from '@angular/core';
declare var dataLayer;
declare var digitalData: {};
declare var _satellite;


@Injectable({
    providedIn: 'root'
})
export class SharedCheckoutLoginUtilService
{

    sendAdobeAnalysis()
    {
        let page = {
            'pageName': "moglix:order checkout:login/signup page",
            'channel': "checkout",
            'subSection': "moglix:order checkout:login/signup page",
        }
        digitalData["page"] = page;
        if(_satellite){
            _satellite.track("genericPageLoad");
        }
    }

    sendUserExistsAdobeAnalysis()
    {
        let page = {
            'pageName': "moglix:order checkout:login page",
            'channel': "checkout",
            'subSection': "moglix:order checkout:login page",
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


}
