import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedAuthUtilService } from '@app/modules/shared-auth-v1/shared-auth-util.service';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { LocalStorageService } from 'ngx-webstorage';
import { AutoLoginService } from './autoLogin.service';


@Component({
  selector: 'app-autologin-page',
  templateUrl: './autologin-page.component.html',
  styleUrls: ['./autologin-page.component.css']
})
export class AutologinPageComponent implements OnInit {
  token : string = null;
  clientId : any = null;

  constructor(
    private router : Router, 
    private activatedRoute : ActivatedRoute,
    private localStorageService: LocalStorageService,
    private autoLoginService:AutoLoginService,
    private localAuthService:LocalAuthService,
    private cartService:CartService,
    private sharedAuthUtilService: SharedAuthUtilService,
    private globalLoaderService: GlobalLoaderService,
    private _toastService:ToastMessageService
    ) { }

  ngOnInit(): void {
    this.globalLoaderService.setLoaderState(true);
    const userData = this.localStorageService.retrieve('user');
    const snap = this.activatedRoute.snapshot.queryParams; 
    if(snap && snap.token && snap.clientId){ 
      this.token = snap.token;
      this.clientId = snap.clientId;
      this.checkUserSession(userData);
    }else{
      this._toastService.show({ type: 'error', text: "Please make sure token and clientId is appended in url" });
      this.router.navigate(['/login']);
      this.globalLoaderService.setLoaderState(false);
    }
  }

  private getTokenVerification() {
    const userSession = this.localAuthService.getUserSession();
    const postBody = { metaInfo : this.token, sessionId : userSession['sessionId'], secret: this.clientId };
    this.autoLoginService.getTokenAuthentication( postBody
    ).subscribe(res=>{
      if(res && res['status'] ){
        this.localStorageService.clear('user');
        this.localAuthService.setUserSession(res['data']);
        const redirectedTo = (res['data']['redirectedTo'] ? res['data']['redirectedTo'] : '');
        this.sharedAuthUtilService.processAuthentication(res['data'], false, redirectedTo);
        if(res['msnList'] && res['msnList'].length>0){
          this.sharedAuthUtilService.msnList = res['msnList'];
          this.sharedAuthUtilService.promocode = res['promocode'] ? res['promocode'] : null;
          this.sharedAuthUtilService.redirectUrl = (res['data']['redirectedTo'] ? res['data']['redirectedTo'] : 'checkout/address');
        }
      }else{
        this.globalLoaderService.setLoaderState(false);
        this.router.navigate(['']); 
      }
    })
  } 

  private checkUserSession(session){
    if(session && typeof session.sessionId == 'string' && session.sessionId !=""){
      this.getAllBrands();
    }else{
      this.cartService.checkForUserAndCartSessionAndNotify().subscribe(status =>{ 
        if(status){
        this.getAllBrands();
        }
      })
    }
  }

  private d2cMsnsProcess(){
    const postBody = { clientId: this.clientId, token:this.token };
    this.autoLoginService.getDecodeD2cToken(postBody).subscribe(res=>{
      if(res["status"] == true && res['data'] && res['data'].length > 0){
        const msnList = res['data'];
        this.autoLoginService.processMsnsAndAddtoCart(msnList, null, "quickorder");
      }else{
        const errMsg = (typeof res['data'] == 'string'? res['data'] :"somthing went wrong");
        this._toastService.show({ type: 'error', text: errMsg });
      }
    })
  }

  private getAllBrands(){
    switch (this.clientId) {
      case "WHATSAPP":
        this.getTokenVerification();
        break;
      case "D2C_BRAND":
        this.d2cMsnsProcess();
        break;
      default:
        this.getTokenVerification();
        break;
    }
  }

}
