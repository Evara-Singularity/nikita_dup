import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedAuthUtilService } from '@app/modules/shared-auth-v1/shared-auth-util.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CartService } from '@app/utils/services/cart.service';
import { DataService } from '@app/utils/services/data.service';
import { LocalStorageService } from 'ngx-webstorage';
import { AutoLoginService } from './autoLogin.service';


@Component({
  selector: 'app-autologin-page',
  templateUrl: './autologin-page.component.html',
  styleUrls: ['./autologin-page.component.css']
})
export class AutologinPageComponent implements OnInit {
  token : string
  userData:any;
  cartAuto:any = null;

  constructor(
    private router : Router, 
    private activatedRoute : ActivatedRoute,
    private localStorageService: LocalStorageService,
    private autoLoginService:AutoLoginService,
    private _dataService: DataService,
    private localAuthService:LocalAuthService,
    private cartService:CartService,
    private sharedAuthUtilService: SharedAuthUtilService,
    ) { }

  ngOnInit(): void {
    this.userData = this.localStorageService.retrieve('user');
    const snap = this.activatedRoute.snapshot.queryParams;
    if(snap && snap.token){
      this.token = snap.token;
      this.checkUserSession(this.userData);
    }else{
      this.router.navigate(['/login']);
    }
  }

  private getTokenVerification(postBody) {
    this.autoLoginService.getTokenAuthentication( postBody
    ).subscribe(res=>{
      if(res && res['status'] ){
        this.localStorageService.clear('user');
        this.localAuthService.setUserSession(res['data']);
        console.log("getTokenAuthentication api call response -->" , res);
        this.sharedAuthUtilService.processAuthentication(res['data'], false, '');
      }else{
        this.router.navigate(['']); 
      }
    })
  } 

  private checkUserSession(session){
    console.log("Session --" , session);
    if(session && typeof session.sessionId == 'string' && session.sessionId !=""){
      console.log("Local mai session mil gya");
      let postBody = { metaInfo : this.token, sessionId : session['sessionId'] };
     this.getTokenVerification(postBody); 
    }else{
      this.cartService.autoLoginSubject.subscribe(res =>{ 
        console.log('cartService.autoLoginSubject--' , res);
      let postBody = { metaInfo : this.token, sessionId : res['sessionId'] };
      //this.localStorageService.store('user' , res);
      this.getTokenVerification(postBody);
      })
    //   console.log("Local mai session nhi  mila");
    //   const user = this.localStorageService.retrieve('user');
    //   console.log("user ---" , user);
    //  this.localStorageService.clear('user');
    //  //this._dataService.getSession().subscribe(res=>{
    //   console.log("getSession api called --");
    //   let postBody = { metaInfo : this.token, sessionId : user['sessionId'] };
    //   //this.localStorageService.store('user' , res);
    //   this.getTokenVerification(postBody);
    //  //})
    }
  }

}
