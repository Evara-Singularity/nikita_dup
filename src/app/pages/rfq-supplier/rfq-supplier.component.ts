import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { SortByComponent } from '@app/components/sortBy/sortBy.component';
import { ToastMessageService } from '@app/modules/toastMessage/toast-message.service';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '@app/utils/services/common.service';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { RfqSupplierService } from './rfq-supplier.service';
import { LocalStorageService } from 'ngx-webstorage';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { ClientUtility } from '@app/utils/client.utility';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-rfq-supplier',
  templateUrl: './rfq-supplier.component.html',
  styleUrls: ['./rfq-supplier.component.scss']
})
export class RfqSupplierComponent implements OnInit {

  openPopup: boolean;
  rfqItemList: any = [];
  rfqcategoryList: Object;
  user: any;
  rfqcategoryListLength: any;
  numericDashboardCount: any = {};
  paramsOfRfqList = {
    limit: 40,
    offset: 0,
    searchString: '',
    categoryName: '',
    userId: null,
  }
  callbackRFQid = null;
  selectedCat: boolean = false;
  searchTerm = new FormControl('', [Validators.required]);
  epochNow = (new Date).getTime();
  userInterestedRFQIDs = [];
  paginationUpdated: Subject<any> = new Subject<any>();
  sortByComponentUpdated: Subject<SortByComponent> = new Subject<SortByComponent>();
  rfqItemListCount: number;
  prelLoginRFqData: any = null;
  prelLoginRFqIndex: any = null;
  page = 1;
  loggedInUser: boolean;
  showLoadMore: boolean = true;
  totalNumberOfListRFq = 0;
  breadCrumbList = [{
    name:'Find B2B Bulk Buyers',
    link:'/find-b2b-bulk-buyers'
  }];


  private paginationInstance = null;
  @ViewChild('pagination', { read: ViewContainerRef }) paginationContainerRef: ViewContainerRef;

  constructor(
    private _rfqSupplierService: RfqSupplierService,
    private title: Title,
    private meta: Meta,
    private _common: CommonService,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document,
    private _localAuthService: LocalAuthService,
    private _tms: ToastMessageService,
    private _loader: GlobalLoaderService,
    private _localStorageService: LocalStorageService,
    private _commonService: CommonService,
    private _analytics: GlobalAnalyticsService,
    private _route: ActivatedRoute,
    private _router: Router,
  ) { }

  ngOnInit() {
    this.setSeo();
    if (this._common.isBrowser) {
      this.user = this._localAuthService.getUserSession();
      this.searchTerm.valueChanges.pipe(
        debounceTime(400))
        .subscribe(term => {
          if (term.trim().length > 2) {
            this.search(term.trim());
          }
          if (term.trim() == '') {
            this.search('');
        }
        });

      this._common.loginPerformedNotify().subscribe(user => {
        this.loggedInUser = true;
        if (this.prelLoginRFqData) {
          this.callSupplyInternal(this.prelLoginRFqData, this.prelLoginRFqIndex);
        } else {
          this._tms.show({ type: 'success', text: 'Thank you for showing interest. We will get in touch with you within 48 hours' });
        }
      });
      
    }

    this._route.queryParamMap.subscribe(query=>{
      if(query.get('category')) {
        this.paramsOfRfqList['categoryName'] = query.get('category');
      } 
      if(query.get('search')) {
        this.searchTerm.setValue(query.get('search'));
        this.paramsOfRfqList['searchString'] = query.get('search'); 
      }
      // console.log('paramsOfRfqList', this.paramsOfRfqList);
      this.processData()
    })


  }

  processData() {
    this.setAnalyticTags('Find B2B Bulk Buyers','Find B2B Bulk Buyers',false);
    this.processRfqListData();
    this.processRfqCategories();
    this.getNumericdashboard();
  }

  setSeo() {
    this.title.setTitle("Find B2B Bulk Buyers to Grow Your Business | Moglix.com");
    this.meta.addTag({ "property": "og:title", "content": "Find B2B Bulk Buyers to Grow Your Business | Moglix.com" });
    this.meta.addTag({ "property": "og:description", "content": "Moglix is India's largest B2B online portal connecting buyers and sellers. Suppliers can easily find buyers on the platform & can do bulk sales at one place." });
    this.meta.addTag({ "property": "og:url", "content": " https://www.moglix.com/find-b2b-bulk-buyers"});
    this.meta.addTag({ "name": "description", "content": "Moglix is India's largest B2B online portal connecting buyers and sellers. Suppliers can easily find buyers on the platform & can do bulk sales at one place." });
    this.meta.addTag({ "name": "robots", "content": 'index,follow' });
    if (this._common.isServer) {
      let links = this._renderer2.createElement('link');
      links.rel = "canonical";
      links.href = "https://www.moglix.com/find-b2b-bulk-buyers";
      this._renderer2.appendChild(this._document.head, links);
    }
  }

  setAnalyticTags(pageName,subSection,genericClick)
  {
      let user;
      if (this._localStorageService.retrieve('user')) {
          user = this._localStorageService.retrieve('user');
      }
      /*Start Adobe Analytics Tags */
      let page = {
          'pageName': "moglix:" + pageName,
          'channel': "article",
          'subSection': "moglix:" +subSection,
          'loginStatus': (user && user["authenticated"] == 'true') ? "registered user" : "guest"
      };
      const digitalData = {};
      digitalData['page'] = page;
      digitalData['custData'] = this._commonService.custDataTracking;
      // setTimeout(() => this._analytics.sendAdobeCall(digitalData, genericClick));
      /*End Adobe Analytics Tags */
  }

  processRfqListData() {

    const user = this._localAuthService.getUserSession();
    if (user && user.authenticated == 'true') {
      this.loggedInUser=true;
      this.paramsOfRfqList['userId'] = user['userId'];
      // console.log('this.paramsOfRfqList', this.paramsOfRfqList);
      this.newFuprocessRfqListDataCore(true);
    } else {
      this.loggedInUser=false;
      this.newFuprocessRfqListDataCore(true);
    }
  }

  newFuprocessRfqListDataCore(pagination = false) {
    this._loader.setLoaderState(true);
    this._rfqSupplierService.getRfqList(this.paramsOfRfqList).subscribe(res => {
      this._loader.setLoaderState(false);
      if (res['status'] && res['statusCode'] == 200 && res['data']['totalCount'] > 0) {
        // console.log("nikkkkkkk", this.rfqItemListCount)
        this.totalNumberOfListRFq = res['data']['totalCount'];
        if (pagination) {
          this.paginationUpdated.next({ itemCount: res['data']['totalCount'] });
        }
        const newData = res['data']['rfqResponseItemList'].map(item => {
          item['timeDiff'] = this.timeDateCalculation(item['postedAt'])
          if (res['data']['supplierRFQList'].includes(item.rfqId.toString())) {
            item['interested'] = true;
          } else {
            item['interested'] = false;
          }
          return item;
        });
        this.rfqItemList = [...this.rfqItemList, ...newData];
        this.rfqItemListCount = this.rfqItemList.length
        this.userInterestedRFQIDs = res['data']['supplierRFQList'];
        if (this.rfqItemListCount>=40) {
          this.showLoadMore = true;
        }
        
      } else if (res['status'] && res['statusCode'] == 200 && res['data']['totalCount'] == 0) {
        this.showLoadMore = false;
        this.rfqItemListCount = this.rfqItemList.length;
        // this.rfqItemListCount = 0
        // console.log("nikkkkkkk", this.rfqItemListCount)
      }

    })
  }
  processRfqCategories() {
    this._rfqSupplierService.getCategories().subscribe(res => {
      if (res['status'] && res['statusCode'] == 200) {
        this.rfqcategoryList = res['data'];
        this.rfqcategoryListLength = (Object.keys(this.rfqcategoryList)).length
      } else {
      }
    })
  }

  processImage(image) {
    const imageLink = image.split("||");
    return "https://cdn.moglix.com/" + imageLink[0];
  }

  supply(item, index) {
    if (this._common.isBrowser) {
      this.setAnalyticTags('Supplier','Supplier Intrest CTA',true);
      const user = this._localAuthService.getUserSession();
      if (user && user.authenticated == 'true') {
        this.callSupplyInternal(item, index, false);
      } else {
        // const callback = () => this.callSupplyInternal(item, index)
        // this._state.notifyDataChanged('loginPopup.open', { callbacks: [callback] });
        this.prelLoginRFqData = item; 
        this.prelLoginRFqIndex = index; 
        this._common.setInitaiteLoginPopUp(null);
      }
    }
  }

  openLogin() {
    this.setAnalyticTags('Supplier','Supplier Intrest CTA',true);
    const user = this._localAuthService.getUserSession();
    if (user && user.authenticated == 'true') {
      this.loggedInUser = true;
    }else{

      this._common.setInitaiteLoginPopUp(null);
    }
  }


  callSupplyInternal(item, index, refreshMode = false) {
    const user = this._localAuthService.getUserSession();
    console.log('callSupplyInternal', 'called', item, user);
    const request = {
      "rfqId": item.rfqId,
      "rfqItemId": item.rfqItemId || null,
      "userId": user.userId,
      "qty": item.quantity,
      "userName": user.userName,
      "email": user.email || '',
      "mobile": user.phone,
      "status": "Open",
      "description": '',
      "productName": item.productName,
      "msn": item.msn,
      "brand": item.brand,
      "category": item.categoryName
    }
    console.log('item', item, index, this.rfqItemList);
    this._loader.setLoaderState(true);
    this._rfqSupplierService.captureInterestApi(request).subscribe(response => {
      this._loader.setLoaderState(false);
      this._tms.show({ type: 'success', text: 'Thank you for showing interest, request submitted successfully. We will get in touch with you within 48 hours' });
      if (response && response['data']) {
        this.rfqItemList[index]['interested'] = true;
      }
      if (refreshMode) {
        this.processRfqListData();
      }
    })

  }

  getNumericdashboard() {
    this._rfqSupplierService.numericdashboard().subscribe(res => {
      if (res['status'] && res['statusCode'] == 200 && res['data']) {
        this.numericDashboardCount = res['data']
      } else {
      }
    })
  }

  rfqSupplierCategory(category) {
    this.selectedCat = true;
    this.paramsOfRfqList['categoryName'] = category.name;
    this.paramsOfRfqList['offset'] = 0;
    this.rfqItemList = [];
    this.togglePopup(false);
    ClientUtility.scrollToTop(100);
    const query = { 'category': category.name };
    if (this.paramsOfRfqList.searchString) {
      query['search'] = this.paramsOfRfqList.searchString;
    }
    this._router.navigate([], { queryParams: query })
  }

  search(string) {
    // console.log('term', string);
    this.paramsOfRfqList['searchString'] = string;
    this.paramsOfRfqList['offset'] = 0;
    this.rfqItemList = [];
    // this.processRfqListData();
    let query = {};
    if (string) {
      query = { 'search': string };
    }
    if (this.paramsOfRfqList.categoryName) {
      query['category'] = this.paramsOfRfqList.categoryName;
    }
    ClientUtility.scrollToTop(100);
    this._router.navigate([], { queryParams: query })
  }


  timeDateCalculation(previous) {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;
    var elapsed = new Date().getTime() - previous;
    if (elapsed < msPerMinute) {
      return Math.round(elapsed / 1000) + ' seconds ago';
    }
    else if (elapsed < msPerHour) {
      return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }
    else if (elapsed < msPerDay) {
      return Math.round(elapsed / msPerHour) + ' hours ago';
    }
    else if (elapsed < msPerMonth) {
      return Math.round(elapsed / msPerDay) + ' days ago';
    }
    else if (elapsed < msPerYear) {
      return Math.round(elapsed / msPerMonth) + ' months ago';
    }
    else {
      return Math.round(elapsed / msPerYear) + ' years ago';
    }
  }

  pageChanged() {
    if (this.page == 1) {
      this.paramsOfRfqList.offset = 0;
      this.paramsOfRfqList.limit = 40
    } else {
      this.paramsOfRfqList.offset = (this.page - 1) * 40;
      this.paramsOfRfqList.limit = 40
    }
    this.newFuprocessRfqListDataCore(false);
  }


  isRFQAlreadyIncluded(rfqId) {
    return this.userInterestedRFQIDs.includes(rfqId.toString());
  }

  removeFilter() {
    this.paramsOfRfqList['categoryName'] = '';
    this.paramsOfRfqList.offset = 0;
    this.rfqItemList = [];
    const query = {};
    if (this.paramsOfRfqList.searchString) {
      query['search'] = this.paramsOfRfqList.searchString;
    }
    ClientUtility.scrollToTop(100);
    this._router.navigate([], { queryParams: query })
    // this.processRfqListData();
  }

  togglePopup(mode: boolean) {
    if (mode) {
      this.openPopup = true
      this._common.setBodyScroll(null, false);
    } else {
      this.openPopup = false
      this._common.setBodyScroll(null, true);
    }
  }

  loadMore() {
    // this.page = this.page++;
    const queryObject = Object.assign({}, this.paramsOfRfqList)
    queryObject.offset = queryObject.offset + queryObject.limit;
    this.paramsOfRfqList = Object.assign({}, queryObject);
    //console.log('requsst', queryObject, Object.assign({}, this.paramsOfRfqList));
    this.newFuprocessRfqListDataCore(false);
  }

  fancyCurrency(amount){
    const lac = {
      'name': 'Lakhs',
      'amount': 100000
    };
    const crore = {
      'name': 'Cr',
      'amount': 10000000
    }; 
    // console.log(amount, (amount / crore.amount), (amount / crore.amount >= 1));
    if (amount / crore.amount >= 1) {
      return {
        amount: (amount / crore.amount).toFixed(2) ,
        denomination: crore.name
      };
    } else {
      return {
        amount: (amount / lac.amount).toFixed(2),
        denomination: lac.name
      };
    }
  }




}
