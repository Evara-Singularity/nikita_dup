import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  Injector,
  OnInit,
  ViewChild,
  ViewContainerRef,
  EventEmitter,
  Input,
} from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { filter } from "rxjs/operators";

@Component({
  selector: "login-popup",
  templateUrl: "./login-popup.component.html",
  styleUrls: [],
})
export class LoginPopupComponent implements OnInit, AfterViewInit {
  authInstance = null;
  @ViewChild("authPopUp", { read: ViewContainerRef })
  authInstanceref: ViewContainerRef;
  isLoginPopUpRouteBased: boolean;
  @Input("isRouteBased") isRouteBased = true;

  constructor(
    private _commonService: CommonService,
    private _router: Router,
    private _aRoute: ActivatedRoute,
    private cfr: ComponentFactoryResolver,
    private injector: Injector,
    private _loader: GlobalLoaderService,
    private _localAuthService: LocalAuthService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    const user = this._localAuthService.getUserSession();
    if (user && user["authenticated"] !== "true") {
      if (this.isRouteBased) {
        this.navigationSubscription(); //for #auth
      } else {
        this._commonService.getInitaiteLoginPopUp().subscribe((redirectUrl) => {
          // console.log('redirectUrl', redirectUrl);
          this.initiatePopUp(redirectUrl);
        });
      }
    }
  }

  initiatePopUp(redirectUrl=null) {
    const user = this._localAuthService.getUserSession();
    if (user && user["authenticated"] !== "true") {
      this._loader.setLoaderState(true);
      this.openLoginPopUp(redirectUrl).then(() => {
        this._loader.setLoaderState(false);
      });
    }
  }

  navigationSubscription() {
    this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (this._aRoute.snapshot.fragment === "auth") {
          this.initiatePopUp();
        }
      });
    this._aRoute.snapshot.fragment === "auth" ? this.initiatePopUp() : null;
  }

  async openLoginPopUp(redirectUrl=null) {
    setTimeout(async () => {
      const { SharedAuthPopUpComponent } = await import(
        "../../modules/shared-auth-popup/shared-auth-popup.component"
      ).finally(() => {});
      const factory = this.cfr.resolveComponentFactory(
        SharedAuthPopUpComponent
      );
      this.authInstance = this.authInstanceref.createComponent(
        factory,
        null,
        this.injector
      );
      this.authInstance.instance["flow"] = "login";
      this.authInstance.instance["redirectUrl"] = redirectUrl;
      (
        this.authInstance.instance[
          "removeAuthComponent$"
        ] as EventEmitter<boolean>
      ).subscribe((data) => {
        this.authInstance = null;
        this.authInstanceref.remove();
        // this._router.navigate([]);
      });
    }, 100);
  }

  ngOnDestroy() {
    if (this.authInstance) {
      this.authInstance = null;
      this.authInstanceref.remove();
    }
  }

}
