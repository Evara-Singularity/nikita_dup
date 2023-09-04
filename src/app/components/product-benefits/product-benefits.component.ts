import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '../../utils/services/common.service';
import CONSTANTS from '@app/config/constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'product-benefits',
  templateUrl: './product-benefits.component.html',
  styleUrls: ['./product-benefits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductBenefitsComponent implements OnInit {
  productStaticData = this._commonService.defaultLocaleValue;
  @Input() isProductReturnAble: boolean;
  @Input() productOutOfStock: boolean;
  @Input() isBrandMsn: boolean = false;
  @Input() moduleUsedIn = '';
  @Output() navigateToFAQ$: EventEmitter<any> = new EventEmitter<any>();
  imagePathAsset = CONSTANTS.IMAGE_ASSET_URL
  changeStaticSubscription: Subscription = null;
  constructor(
    public _localAuthService: LocalAuthService,
    private _commonService:CommonService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getStaticSubjectData();
  }
  getStaticSubjectData(){
    this.changeStaticSubscription =  this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
      this.cdr.detectChanges();
    });
  }

  navigateToFAQ() {
    this.navigateToFAQ$.emit();
  }

  ngOnDestroy() {
    if(this.changeStaticSubscription) {
      this.changeStaticSubscription.unsubscribe();
    }
  }

}

@NgModule({
  declarations: [ProductBenefitsComponent],
  imports: [
    CommonModule,
  ],
  exports: [
    ProductBenefitsComponent
  ]
})
export class ProductBenefitsModule { }