import { AfterViewInit, Component, ComponentFactoryResolver, Injector, OnInit, ViewChild, ViewContainerRef, EventEmitter } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: []
})
export class LoginPopupComponent implements OnInit, AfterViewInit {

  authInstance = null;
  @ViewChild("authPopUp", { read: ViewContainerRef })
  authInstanceref: ViewContainerRef;
  private;

  constructor(
    private _commonService: CommonService,
    private _router: Router,
    private _aRoute: ActivatedRoute,
    private cfr: ComponentFactoryResolver,
    private injector: Injector,
    private _loader: GlobalLoaderService,
    private _localAuthService:LocalAuthService
  ) { }

  ngOnInit(): void {
    console.log('login popup ==>');
  }

  ngAfterViewInit() {
    const user = this._localAuthService.getUserSession();
    if (user && user['authenticated'] !== 'true') {
      this.navigationSubscription();
      this._commonService.getInitaiteLoginPopUp().subscribe((value) => {
        if (value) {
          console.log('login popup ==> using subscriber');
          this.openLoginPopUp();
        }
      })
    }
  }

  navigationSubscription() {
    this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (this._aRoute.snapshot.fragment === "auth") {
          this._loader.setLoaderState(true);
          console.log('function called');
          this.openLoginPopUp().then(() => {
            this._loader.setLoaderState(false);
          });
        }
      });
    this._aRoute.snapshot.fragment === "auth" ? this.openLoginPopUp().then(() => this._loader.setLoaderState(false)) : null;
  }

  async openLoginPopUp() {
    setTimeout(async () => {
      const { SharedAuthPopUpComponent } = await import(
        "../../modules/shared-auth-popup/shared-auth-popup.component"
      ).finally(() => {
        console.log('openLoginPopUp module loaded');
      });

      const factory = this.cfr.resolveComponentFactory(SharedAuthPopUpComponent);
      this.authInstance = this.authInstanceref.createComponent(
        factory,
        null,
        this.injector
      );
      this.authInstance.instance["flow"] = 'login';
      (
        this.authInstance.instance[
        "removeAuthComponent$"
        ] as EventEmitter<boolean>
      ).subscribe((data) => {
        this.authInstance = null;
        this.authInstanceref.remove();
        this._router.navigate([]);
      });
    }, 600);
  }

  ngOnDestroy() {
    if (this.authInstance) {
      this.authInstance = null;
      this.authInstanceref.remove();
    }
  }

}
