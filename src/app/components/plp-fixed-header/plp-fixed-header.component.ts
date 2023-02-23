import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '@app/utils/services/cart.service';
import { NavigationEnd, Router } from '@angular/router';



@Component({
  selector: 'plp-fixed-header',
  templateUrl: './plp-fixed-header.component.html',
  styleUrls: ['./plp-fixed-header.component.scss']
})
export class PlpFixedHeaderComponent implements OnInit, OnDestroy {

  @Output() loadBottomSheet$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() loadSearchNav$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() goBack$: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() noOfCart: number = 0;
  @Input() ModuleName:string='' ;

  searchValue='';
  buyNow:boolean = false;
  pdpPage=false;

  constructor(
    public _commonService: CommonService,
    public route: ActivatedRoute,
    public cartService:CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.buyNow = this.cartService.buyNow == undefined ? false : this.cartService.buyNow;
    this.route.queryParams.subscribe(res => {
      this.searchValue = (res['search_query']) ? res['search_query'] : ''
    })
    this.cartService.cartCountSubject.subscribe(res=>{
     // console.log("fixed header --" , this.cartService.buyNow);
       window.location.reload(); 
    })
  }

  ngOnDestroy(): void {
    this.cartService.cartCountSubject.unsubscribe();
  }

}
