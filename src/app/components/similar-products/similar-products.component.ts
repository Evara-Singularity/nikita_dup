import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../utils/services/product.service';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { CommonService } from '../../utils/services/common.service';
import CONSTANTS from '@app/config/constants';
import { ClientUtility } from '@app/utils/client.utility';

@Component({
    selector: 'app-similar-products',
    templateUrl: './similar-products.component.html',
    styleUrls: ['./similar-products.component.scss']
})
export class SimilarProductsComponent implements OnInit
{
    readonly imagePath = CONSTANTS.IMAGE_BASE_URL;
    openViewAllPopup: boolean = false;
    similarProducts = null;
    @Input('outOfStock') outOfStock = false;
    @Input('productName') productName;
    @Input('categoryCode') categoryCode;
    @Output() showAll: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        public commonService: CommonService, 
        private router:Router,
        private productService: ProductService
    ) { }

    ngOnInit(): void {
        this.getProductSimilar();
    }

    getProductSimilar() {
        this.productService.getSimilarProducts(this.productName, this.categoryCode).subscribe((response: any) => {
            let products = response['products'];
            if (products && (products as []).length > 0) {
                this.similarProducts = products;
                this.buildSimilarProducts(this.similarProducts);
            }
        })
    }

    buildSimilarProducts(products: any[])
    {
        const sp = [];
        products.forEach(product =>
        {
            const spitem = {
                productUrl: product['productUrl'],
                mainImageLink: product['mainImageLink'],
                productName: product['productName'],
                salesPrice: product['salesPrice'],
                priceWithoutTax: product['priceWithoutTax'],
                brandName: product['productUrl'],
                mrp: product['mrp'],
                discount: product['discount']
            }
            spitem['shortDesc'] = [];
            const result = product.shortDesc ? product.shortDesc.split('||') : [];
            result.forEach(element =>
            {
                const keyvalue = element ? element.split(':') : [];
                spitem['shortDesc'].push({ 'key': keyvalue[0], 'value': keyvalue[1] })
            })
            sp.push(spitem);
        });
        this.similarProducts = sp;
    }

    showAllSimilar()
    {
        this.showAll.emit(this.similarProducts);
    }

    navigateTo(url){
        this.commonService.setSectionClickInformation(this.outOfStock ? 'similar_product_oos' : 'similar_products', 'pdp')
        this.router.navigateByUrl(url);
        if ( this.commonService.isBrowser ) {
            ClientUtility.scrollToTop(100);
        }
    }

}

@NgModule({
    declarations: [
        SimilarProductsComponent
    ],
    imports: [
        CommonModule,
        MathFloorPipeModule,
        MathCeilPipeModule,
    ]
})
export class ProductModule { }