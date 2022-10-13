import { CommonModule } from '@angular/common';
import { Component, EventEmitter, NgModule, OnInit, Output } from '@angular/core';
import { BottomMenuModule } from '../bottomMenu/bottom-menu.module';

@Component({
  selector: 'app-goldMembership',
  templateUrl: './goldMembership.component.html',
  styleUrls: ['./goldMembership.component.scss']
})
export class GoldMembershipComponent implements OnInit {

  @Output() closePopup: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() closePopupOnOutsideClick: EventEmitter<{}> = new EventEmitter<{}>();

  constructor() { }

  ngOnInit() {}

  closeGoldPopup(data) {
    this.closePopup.emit(data)
  }

  popupOnOutsideClick(data){
  this.closePopupOnOutsideClick.emit(data)
  }
}

@NgModule({
  declarations: [
    GoldMembershipComponent
  ],
  imports: [
    CommonModule,
    BottomMenuModule
  ],
  exports:[GoldMembershipComponent]
})
export class GoldMembershipModule { }

