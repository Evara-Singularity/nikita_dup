import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { LocalAuthService } from '@app/utils/services/auth.service';
import { CommonService } from '../../utils/services/common.service';
import CONSTANTS from '@app/config/constants';

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

  constructor(
    public _localAuthService: LocalAuthService,
    private _commonService:CommonService
  ) { }

  ngOnInit(): void {
    this.getStaticSubjectData();
  }
  getStaticSubjectData(){
    this._commonService.changeStaticJson.subscribe(staticJsonData => {
      this.productStaticData = staticJsonData;
    });
  }

  navigateToFAQ() {
    this.navigateToFAQ$.emit();
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