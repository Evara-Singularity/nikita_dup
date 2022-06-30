import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'home-expanded-header',
  templateUrl: './home-expanded-header.component.html',
  styleUrls: ['./home-expanded-header.component.scss']
})
export class HomeExpandedHeaderComponent implements OnInit {

  @Output() loadSideNav$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() navigateToLogin$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() loadSearchNav$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() goBack$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() noOfCart: number = 0;
  @Input() isUserLogin: boolean = false;
  @Input() enableBackBtn: boolean = false;
  @Input() imgAssetPath: boolean = false;
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
