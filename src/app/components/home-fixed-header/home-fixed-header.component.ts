import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'home-fixed-header',
  templateUrl: './home-fixed-header.component.html',
  styleUrls: ['./home-fixed-header.component.scss']
})
export class HomeFixedHeaderComponent implements OnInit {

  @Output() loadSideNav$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() loadSearchNav$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() noOfCart: number = 0;

  constructor(
    public _commonService: CommonService
  ) { }

  ngOnInit(): void {
  }

}
