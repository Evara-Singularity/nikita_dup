import { Injectable } from '@angular/core';
import { CartService } from '../../../utils/services/cart.service';
declare var dataLayer;
declare var digitalData: {};
declare var _satellite;


@Injectable()
export class SharedSignUtilService {

  private isCheckout: boolean = false;

  constructor(private cartService: CartService) { }

  set setCheckout(value: boolean) {
    this.isCheckout = value;
  }

    sendCheckoutAdobeAnalysis()
    {
        let page = {
            'pageName': "moglix:order checkout signup form",
            'channel': "checkout",
            'subSection': "moglix:order checkout signup form details",
        }
        digitalData["page"] = page;
        if(_satellite){
          _satellite.track("genericPageLoad");
        }
    }

  pushCheckoutEvents(cartSession) {
    let dlp = [];
    let dlc = [];

    for (let p = 0; p < cartSession['itemsList'].length; p++) {
      let temp_dlp = {
        id: cartSession['itemsList'][p]['productId'],
        name: cartSession['itemsList'][p]['productName'],
        price: cartSession['itemsList'][p]['totalPayableAmount'],
        variant: '',
        quantity: cartSession['itemsList'][p]['productQuantity']
      };
      let temp_dlc = {
        CPURL: cartSession['itemsList'][p]['productUrl'],
        SPDNAME: cartSession['itemsList'][p]['productName'],
        IPRQT: cartSession['itemsList'][p]['productQuantity']
      };
      dlp.push(temp_dlp);
      dlc.push(temp_dlc);
    }

    dataLayer.push({ 'event': 'registerNormalUser', });
    dataLayer.push({ 'event': 'pr-checkout', 'pName': dlc, });
    dataLayer.push({
      'event': 'checkout',
      'ecommerce': {
        'checkout': {
          'actionField': { 'step': 2, 'option': 'login' },
          'products': dlp
        }
      },
    });
  }

  getNightFlag() {
    let NIGHTFLAG = false;
    let td: any = new Date();
    td.setHours(21, 0, 0);
    td = td.getTime() / 1000;
    let nd: any = new Date();
    nd.setHours(8, 0, 0);
    nd.setDate(nd.getDate() + 1);
    nd = nd.getTime() / 1000;
    let cd: any = new Date();
    cd.setHours(cd.getHours() + 2);
    cd = cd.getTime() / 1000;
    if (cd > td && cd < nd) {
      NIGHTFLAG = true;
    }
    return NIGHTFLAG;
  }

  sendCriteoDataLayerTags(userId, params) {
    dataLayer.push({
      'event': 'setEmail',
      'email': params['email'] ? params['email'] : params['phone'],
      'phone': params['phone'] ? params['phone'] : "",
      'name': params['userName'] ? params['userName'] : "",
    });
    dataLayer.push({
      'event': 'user_login',
      id: userId,
      first_name: params.firstName,
      last_name: params.lastName,
      phone: params.phone,
      email: params.email,
      user_type: params.userType
    });
    dataLayer.push({
      'event': 'registerNormalUser',
    });
  }

  pushNormalUser() {
    let pushData = true;
    for (let i = 0; i < dataLayer.length; i++) {
      if (dataLayer[i]['event'] == 'registerBusinessUser')
        pushData = false;
    }
    if (pushData) {
      dataLayer.push({
        'event': 'registerBusinessUser'
      });
    }
  }
}