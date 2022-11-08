import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedAuthUtilService } from '@app/modules/shared-auth-v1/shared-auth-util.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { LocalStorageService } from 'ngx-webstorage';
import { map } from 'rxjs/operators';
import { AutoLoginService } from './autoLogin.service';


@Component({
  selector: 'app-autologin-page',
  templateUrl: './autologin-page.component.html',
  styleUrls: ['./autologin-page.component.css']
})
export class AutologinPageComponent implements OnInit {
  token : string

  constructor(
    private router : Router, 
    private activatedRoute : ActivatedRoute,
    private localStorageService: LocalStorageService,
    private autoLoginService:AutoLoginService,
    private localAuthService:LocalAuthService,
    private cartService:CartService,
    private sharedAuthUtilService: SharedAuthUtilService,
    private globalLoaderService: GlobalLoaderService
    ) { }

  ngOnInit(): void {
    this.globalLoaderService.setLoaderState(true);
    const userData = this.localStorageService.retrieve('user');
    const snap = this.activatedRoute.snapshot.queryParams;
    if(snap && snap.token){
      this.token = snap.token;
      this.checkUserSession(userData);
    }else{
      this.router.navigate(['/login']);
    }
  }

  private getTokenVerification(postBody) {
    this.autoLoginService.getTokenAuthentication( postBody
    ).subscribe(res=>{
      if(res && res['status'] ){
        this.cartService.getCartBySession({sessionId : postBody.sessionId}).pipe(
          map(res=> {
            if(res && res.status){
            const updatedCartSession = this.cartService.generateGenericCartSession(res);
            this.cartService.setGenericCartSession(updatedCartSession);
            this.localStorageService.clear('user');
            this.localAuthService.setUserSession(res['data']);
            let redirectedTo = (res['data']['redirectedTo'] ? res['data']['redirectedTo'] : '');
            this.sharedAuthUtilService.processAuthentication(res['data'], false, redirectedTo);
            }else{
              this.globalLoaderService.setLoaderState(false);
              this.router.navigate(['']); 
            }
          })
        )
      }else{
        this.globalLoaderService.setLoaderState(false);
        this.router.navigate(['']); 
      }
    })
  } 

  private checkUserSession(session){
    if(session && typeof session.sessionId == 'string' && session.sessionId !=""){
      let postBody = { metaInfo : this.token, sessionId : session['sessionId'] };
     this.getTokenVerification(postBody); 
    }else{
      this.cartService.autoLoginSubject.subscribe(res =>{ 
      let postBody = { metaInfo : this.token, sessionId : res['sessionId'] };
      this.getTokenVerification(postBody);
      })
    }
  }

}
