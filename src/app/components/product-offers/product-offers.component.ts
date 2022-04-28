import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, Output, EventEmitter, Input } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { ProductService } from '../../utils/services/product.service';

@Component({
    selector: 'app-product-offers',
    templateUrl: './product-offers.component.html',
    styleUrls: ['./product-offers.component.scss']
})
export class ProductOffersComponent implements OnInit
{
    readonly imagePathAsset = CONSTANTS.IMAGE_ASSET_URL;
    allofferData: any = null;
    @Output() viewPopUpHandler: EventEmitter<any> = new EventEmitter<any>();
    @Output() emaiComparePopUpHandler: EventEmitter<any> = new EventEmitter<any>();
    @Input() price = 0;
    @Input() gstPercentage;
    disableEMIView = false;

    constructor(
        private productService: ProductService
    ) { }

    ngOnInit(): void
    {
        if (this.price < 3000) { this.disableEMIView = true; }
        this.getOfferData();
    }

    getOfferData()
    {
        this.productService.getAllOffers().subscribe((data: any) => {
            if (data.statusCode == 200) {
                this.allofferData = (data.data as any[]).map((item: any, index) => Object.assign({}, item, { index }));
            }
        });
    }

    sendOfferData(offerData)
    {
        this.viewPopUpHandler.emit(offerData);
    }

    openEmiPopup()
    {
        if (this.disableEMIView) return;
        this.emaiComparePopUpHandler.emit(true);
    }

}
@NgModule({
    declarations: [ProductOffersComponent],
    imports: [
        CommonModule
    ]
})
export class ProductOffersModule
{

}
