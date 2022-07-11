import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import { ActivatedRoute } from '@angular/router';


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
  searchValue='';

  constructor(
    public _commonService: CommonService,
    public route: ActivatedRoute,
  ) { }

  ngOnInit(): void {

    this.route.queryParams.subscribe(res => {
      this.searchValue = (res['search_query']) ? res['search_query'] : ''
    })
  }

}
