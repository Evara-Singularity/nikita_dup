import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CONSTANTS } from "@app/config/constants";
import { ENDPOINTS } from "@app/config/endpoints";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { CartService } from "@app/utils/services/cart.service";
import { DataService } from "@app/utils/services/data.service";
import { forkJoin, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { ToastMessageService } from "../toastMessage/toast-message.service";

@Component({
  selector: "shared-checkout-unavailable-items",
  templateUrl: "./shared-checkout-unavailable-items.component.html",
  styleUrls: ["./shared-checkout-unavailable-items.component.scss"],
})
export class SharedCheckoutUnavailableItemsComponent implements OnInit {
  @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
  @Input() data: any;
  @Input() user: {};
  @Input() showLink = true;
  private cDistroyed = new Subject();
  itemsList: [] = [];
  wishListPostBody = [];

  constructor(
    public _cartService: CartService,
    public _localAuthService: LocalAuthService,
    private _dataService: DataService,
    private _tms: ToastMessageService
  ) {}

  ngOnInit() {
    this.itemsList = this.data["items"];
    const userSession = this._localAuthService.getUserSession();
    this.itemsList.forEach((elememt) => {
      this.wishListPostBody.push({
        idUser: userSession.userId,
        userType: "business",
        idProduct: elememt["productId"] || elememt["defaultPartNumber"],
        productName: elememt["productName"],
        description: elememt["productDescripton"],
        brand: elememt["brandName"],
        category: elememt["categoryCode"],
      });
    });
  }

  onUpdate($event) {
    this._cartService.showUnavailableItems = false;
  }

  removeUnavailableItems(callback) {
    this.closeModal();
    callback(this.itemsList);
  }

  closeModal() {
    this._cartService.showUnavailableItems = false;
  }

  addToWishList() {
    const allApis = [];
    this.wishListPostBody.forEach((ele) => {
      const url = CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.ADD_PURCHASE_LIST;
      const addToWishListApi = this._dataService
        .callRestful("POST", url, { body: ele })
        .pipe(
          map((res) => {
            return res;
          })
        );
      allApis.push(addToWishListApi);
    });

    forkJoin(allApis).subscribe(
      (response) => {
        if (response["status"]) {
          this._tms.show({
            type: "success",
            text: "Product added to wishlist.",
          });
          this.closeModal();
        } else {
          this._tms.show({
            type: "success",
            text: response["errorMessage"],
          });
          this.closeModal();
        }
      },
      (error) => {
        this._tms.show({
          type: "success",
          text: "Something went wrong.",
        });
        this.closeModal();
      }
    );
  }

  ngOnDestroy() {
    this.cDistroyed.next();
    this.cDistroyed.unsubscribe();
  }
}
