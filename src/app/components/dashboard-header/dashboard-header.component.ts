import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';

@Component({
  selector: 'dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class DashboardHeaderComponent implements OnInit {

  @Output() loadSideNav$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() navigateToLogin$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() loadSearchNav$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() goBack$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() loadBottomSheet$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() noOfCart: number = 0;
  @Input() title: string = 'Home';
  @Input() isUserLogin: boolean = false;
  @Input() enableBackBtn: boolean = false;
  @Input() imgAssetPath: boolean = false;

  constructor(
    public _commonService: CommonService,
    private location: Location,
  ) { }

  ngOnInit(): void {
  }

  goBack(){
    this.location.back();
  }

}
