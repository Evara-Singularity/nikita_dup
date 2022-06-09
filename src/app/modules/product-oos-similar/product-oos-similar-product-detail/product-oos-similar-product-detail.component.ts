import { HttpClient } from "@angular/common/http";
import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Injector,
  Input,
  EventEmitter,
  ViewChild,
  ViewContainerRef,
  Output,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { NavigationExtras, Router } from "@angular/router";
import { GLOBAL_CONSTANT } from "@app/config/global.constant";
import { ModalService } from "@app/modules/modal/modal.service";
import { ToastMessageService } from "@app/modules/toastMessage/toast-message.service";
import { AddToCartProductSchema } from "@app/utils/models/cart.initial";
import { ProductInfoSection } from '@app/utils/pipes/product-oos-similar-card-section.pipe';
import { LocalAuthService } from "@app/utils/services/auth.service";
import { CartService } from "@app/utils/services/cart.service";
import { CommonService } from "@app/utils/services/common.service";
import { GlobalAnalyticsService } from "@app/utils/services/global-analytics.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { ProductService } from "@app/utils/services/product.service";
import { ProductListService } from "@app/utils/services/productList.service";
import { forkJoin, of, Subject } from "rxjs";
import { map } from 'rxjs/operators';

@Component({
  selector: "app-product-oos-similar-product-detail",
  templateUrl: "./product-oos-similar-product-detail.component.html",
  styleUrls: ["./product-oos-similar-product-detail.component.scss"],
})

export class ProductOosSimilarProductDetailComponent {
  constructor(
  ) { }
}
