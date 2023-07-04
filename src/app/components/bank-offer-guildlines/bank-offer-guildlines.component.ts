import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';

@Component({
  selector: 'bank-offer-guildlines',
  templateUrl: './bank-offer-guildlines.component.html',
  styleUrls: ['./bank-offer-guildlines.component.scss']
})
export class BankOfferGuildlinesComponent implements OnInit {

  @Input() bm: boolean = true;
  @Input() bankOfferData: any = null;
  
  constructor( ) { }

  ngOnInit(): void { }

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
  imports: [
    CommonModule,
    BottomMenuModule,
    RouterModule
  ],
  declarations: [
    BankOfferGuildlinesComponent
  ]
})
export class BankOfferGuildlinesModule { }