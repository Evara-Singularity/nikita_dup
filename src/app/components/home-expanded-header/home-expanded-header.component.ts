import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { LocalAuthService } from '@app/utils/services/auth.service';


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
  @Input() isUserLogin: boolean = null;
  @Input() enableBackBtn: boolean = false;
  @Input() imgAssetPath: string = "";
  searchValue = '';
  isRoutedBack: boolean;

  constructor(
    public _commonService: CommonService,
    public route: ActivatedRoute,
    public _localAuthService: LocalAuthService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(res => {
      this.isRoutedBack = res && res.hasOwnProperty('back') ? true : false
      this.searchValue = (res['search_query']) ? decodeURIComponent(res['search_query']) : ''
      this._commonService.openLoader().subscribe(resp => {
        if (resp == true) {
          this.loadSearchNav$.emit();
        }
      })
    })
  }
  addLottieScript() {
    this._commonService.addLottieScriptSubject.subscribe(lottieInstance => {
      this._commonService.callLottieScript();
      lottieInstance.next();
    });
  }
  ngAfterViewInit() {
    this.addLottieScript();
    this._commonService.callLottieScript();
  }

  get displayPage() { return this.isUserLogin != null && this.imgAssetPath.length > 0 }

}
