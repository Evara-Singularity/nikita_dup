import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';

@Component({
  selector: 'bank-offer-guildlines',
  templateUrl: './bank-offer-guildlines.component.html',
  styleUrls: ['./bank-offer-guildlines.component.scss']
})
export class BankOfferGuildlinesComponent implements OnInit {
  @Input() bm: boolean = true;
  @Input() bankOfferData : {};

  constructor() { }

  ngOnInit(): void {
  }

  resetBottomOpt() {
    this.bm = false;
    (<HTMLElement>document.getElementById('body')).classList.remove('stop-scroll');
    this.enableScroll();
  }

  preventDefault(e) {
    e.preventDefault();
  }
  enableScroll() {
    document.body.removeEventListener('touchmove', this.preventDefault);
  }

  onUpdate(data) {
    if (data.popupClose) {
      this.resetBottomOpt()
    }
  }

}


@NgModule({
  declarations: [
    BankOfferGuildlinesComponent
  ],
  imports: [
      CommonModule,
      BottomMenuModule,
      RouterModule,
      PopUpModule
  ]
})
export class NavBottomSheetModule { }

