import { Component, EventEmitter, OnInit, Output } from '@angular/core';

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
