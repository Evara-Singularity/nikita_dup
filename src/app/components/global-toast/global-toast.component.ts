import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-global-toast',
  templateUrl: './global-toast.component.html',
  styleUrls: ['./global-toast.component.scss']
})
export class GlobalToastComponent implements OnInit {

  showToast: boolean = true;
  @Input() text: string = null;
  @Input() btnLink: string = null;
  @Input() btnText: string = null;
  @Input() showTime: number = 3000;
  @Input() positionBottom: boolean = false;
  @Input() positionTop: boolean = false;
  @Input() showDuplicateOrderToast = false; 
  @Input() productMsn; 
  @Output() removed: EventEmitter<any> = new EventEmitter<any>();
  userSession;

  constructor(private localStorageService : LocalStorageService) {
  }

  ngOnInit(): void {
    this.userSession = this.localStorageService.retrieve('user');
    let userMsnDuplicateKey = this.localStorageService.retrieve('showDuplicateOrderToast-' + this.userSession.userId);
    if (userMsnDuplicateKey && userMsnDuplicateKey.indexOf(this.productMsn) > -1) {
      this.showToast = false;
    }

    if (!this.showDuplicateOrderToast) {
      setTimeout(() => {
        this.showToast = false;
        this.removed.emit(true);
      }, this.showTime);
    }

  }

  setDuplicateOrderToast() {
    let userMsnDuplicateKey = this.localStorageService.retrieve('showDuplicateOrderToast-' + this.userSession.userId) || [];
    if (userMsnDuplicateKey.indexOf(this.productMsn) < 0) {
      userMsnDuplicateKey.push(this.productMsn);
    }
    this.localStorageService.store(('showDuplicateOrderToast-' + this.userSession.userId) , userMsnDuplicateKey);
    this.showToast = false;
  }

}

@NgModule({
  declarations: [GlobalToastComponent],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class GlobalToastModule {

}
