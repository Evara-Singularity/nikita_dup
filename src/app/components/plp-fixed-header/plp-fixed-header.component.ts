import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'plp-fixed-header',
  templateUrl: './plp-fixed-header.component.html',
  styleUrls: ['./plp-fixed-header.component.scss']
})
export class PlpFixedHeaderComponent implements OnInit {

  @Output() loadBottomSheet$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() loadSearchNav$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() goBack$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() noOfCart: number = 0;

  constructor(
    public _commonService: CommonService
  ) { }

  ngOnInit(): void {
  }

}
