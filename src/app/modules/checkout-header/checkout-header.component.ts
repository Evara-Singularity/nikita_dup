import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { LocalAuthService } from '../../utils/services/auth.service';

@Component({
  selector: 'checkout-header',
  templateUrl: './checkout-header.component.html',
  styleUrls: ['./checkout-header.component.scss']
})
export class CheckoutHeaderComponent implements OnInit {

  isUser: boolean = false;
  @Input() step;
  isBrowser: boolean

  constructor(
    @Inject(PLATFORM_ID) platformId,
    private _localAuthService: LocalAuthService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {

    // intialize on component load
    this.updateUserState();

    // subcribe login state to update state after login flow is completed
    this._localAuthService.login$.subscribe((data) => {
      this.updateUserState();
    })

  }

  updateUserState() {
    const user = this._localAuthService.getUserSession();
    if (user && user['authenticated'] == 'true') {
      this.isUser = true;
    }
  }

}
