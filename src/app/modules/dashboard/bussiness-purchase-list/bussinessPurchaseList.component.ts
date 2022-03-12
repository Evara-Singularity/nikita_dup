import { Component } from "@angular/core";
import { BusinessPurchaseListService } from "./businessPurchaseList.service";
import { LocalStorageService } from "ngx-webstorage";
import { ActivatedRoute } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { map } from "rxjs/operators";
import { Meta } from "@angular/platform-browser";
import { OrderSummaryService } from "@app/modules/orderSummary/orderSummary.service";
import { LocalAuthService } from "@app/utils/services/auth.service";
import CONSTANTS from "@app/config/constants";
import { CartService } from "@app/utils/services/cart.service";
import { CommonService } from "@app/utils/services/common.service";
import { ProductService } from "@app/utils/services/product.service";
import { ToastMessageService } from "@app/modules/toastMessage/toast-message.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";

declare let dataLayer;
declare var digitalData: {};
declare let _satellite;

@Component({
  selector: "bussiness-purchase-list",
  templateUrl: "./bussinessPurchaseList.html",
  styleUrls: ["./bussinessPurchaseList.scss"],
})
export class BussinessPurchaseListComponent {
  IsHidden: boolean = true;

  purchaseLists: Array<any>;
  productResult: any;
  productId: any;
  successMessage: number = -1;
  selectedIndex: number;
  elementIndex: number;
  bulkPriceSelctedQuatity: number;
  uniqueRequestNo = 0;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  JSON = JSON;
  bulkSellingPrice: number = null;
  bulkPriceWithoutTax: number = null;
  sessionDetails: any;
  isShow: boolean = false;
  userSession: any;
  addMatCodeForm: FormGroup;
  scForm: FormGroup;
  spli: Array<{}>;
  spp: boolean = false;
  set showLoader(value){
    this.loaderService.setLoaderState(value);
  }

  constructor(
    private meta: Meta,
    private _activatedRoute: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _businessPurchaseListService: BusinessPurchaseListService,
    private _localAuthService: LocalAuthService,
    private cartService: CartService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private orderSummaryService: OrderSummaryService,
    private _productService: ProductService,
    private _tms: ToastMessageService,
    private loaderService:GlobalLoaderService) {
    
    this.showLoader = false;
    this.spli = [];
    this.getSession();
  }

  ngOnInit() {
    this.meta.addTag({ name: "robots", content: CONSTANTS.META.ROBOT2 });

    let qp = this._activatedRoute.snapshot.queryParams;
    this.scForm = this._formBuilder.group({
      eon: [
        qp["search"] ? qp["search"] : "",
        [Validators.required, Validators.minLength(1)],
      ],
    });
    let userSession = this._localAuthService.getUserSession();

    let pageData = {
      pageName: "”moglix:account dashboard-purchase list",
      channel: "moglix:my account",
      subSection: "moglix:account dashboard-purchase list",
      loginStatus:
        userSession &&
        userSession.authenticated &&
        userSession.authenticated == "true"
          ? "registered user"
          : "guest",
    };
    let custData = {
      customerID:
        userSession && userSession["userId"] ? btoa(userSession["userId"]) : "",
      emailID:
        userSession && userSession["email"] ? btoa(userSession["email"]) : "",
      mobile:
        userSession && userSession["phone"] ? btoa(userSession["phone"]) : "",
      customerType:
        userSession && userSession["userType"] ? userSession["userType"] : "",
    };
    let order = {};
    digitalData["page"] = pageData;
    digitalData["custData"] = custData;
    digitalData["order"] = order;
    if(_satellite){
      _satellite.track("genericPageLoad");
    }
  }

  getPurcahseList() {
    this.showLoader = true;
    let userSession = this._localAuthService.getUserSession();
    let request = { idUser: userSession.userId, userType: "business" };
    this._businessPurchaseListService
      .getPurchaseList(request)
      .pipe(
        map((res) => {
          let index = 0;
          res = res.sort((a, b) => {
            return b.updated_on - a.updated_on;
          });
          return res.map((item) => {
            item["matCodeMode"] = false;
            if (item["matCodeFlag"] == undefined || item["matCodeFlag"] == null)
              item["matCodeFlag"] = false;
            //TODO-REMOVE
            /*below is temporary solution, will remove below line after search is implemented from backend*/
            /*below index is added because after searching on purchase list, index passed by for loop in view doesn't matches the index of object in array*/
            item["index"] = index;
            index++;
            return item;
          });
        })
      )
      .subscribe((res) => {
        this.showLoader = false;
        this.purchaseLists = res;
        let list: Array<any> = res;
        let itemRows: Array<FormGroup> = [];
        list.filter((element, index) => {
          //Filtering out values from array in which productBO is null
          if (element.productDetail.productBO == null) {
            list.splice(index, 1);
          }
        });
        list.forEach((element, index) => {
          itemRows.push(this.createMatCodeForm(element));
        });
        this.addMatCodeForm = this._formBuilder.group({
          itemRows: this._formBuilder.array(itemRows),
        });
      });
  }

  createMatCodeForm(element?) {
    return this._formBuilder.group({
      matCode: [
        element && element["matCode"] && element["matCodeFlag"]
          ? element["matCode"]
          : null,
        [Validators.required],
      ],
    });
  }

  getdata(productdetail) {
    let index = 0;
    for (let productdata of productdetail) {
      this.getProduct(productdata, null);
      index++;
    }
    this.removePromoCode();
    this.updateCartSessions("/quickorder");
  }

  getProduct(productDetail, index) {
    this.successMessage = -1;
    const productObject = {};
    let priceQuantityCountry, partReference, disc;

      let data = productDetail.productBO;
      productObject["productBO"] = data;
      productObject["productName"] = data.productName;
      productObject["partNumber"] = data.partNumber;
      productObject["outOfStock"] = data.outOfStock;
      productObject["brandDetails"] = data.brandDetails;
      productObject["brand"] = data.brandDetails.brandName;
      productObject["manuDetails"] = data.manufDetails;
      productObject["id_brand"] = data.brandDetails.idBrand;
      productObject["id_category_default"] =
        data.categoryDetails[0].categoryCode;
      productObject["description"] = data.desciption;

      productObject["fulldescription"] = data.desciption;

      productObject["description_short"] = data.shortDesc;
      productObject["product_rating"] = data.productRating;
      productObject["product_stars"] =
        (productObject["product_rating"] / 5) * 100;
      productObject["active"] = "1";
      productObject["available_for_order"] = "1";
      productObject["category"] = data.categoryDetails[0].categoryName;
      productObject["is_grouped"] = data.partNumber;
      productObject["product_url"] =
        data.productPartDetails[
          productDetail.productBO.partNumber
        ].canonicalUrl;
      productObject["key_features"] = data.keyFeatures;

      productObject["canonical_url"] =
        data.productPartDetails[
          productDetail.productBO.partNumber
        ].canonicalUrl;
      productObject["main_category"] = data.partNumber;

      productObject["InStock"] = 1;

      productObject["group_elements"] = data.productPartDetails;

      partReference = data.partNumber;
      if (data.productPartDetails[partReference].productPriceQuantity["india"])
        priceQuantityCountry =
          data.productPartDetails[partReference].productPriceQuantity["india"];

      productObject["quantity"] = priceQuantityCountry.quantityAvailable;
      productObject["packageUnit"] = priceQuantityCountry.packageUnit;
      productObject["minimal_quantity"] = priceQuantityCountry.moq;
      productObject["available_now"] = "";
      productObject["available_later"] = "";
      productObject["price"] = priceQuantityCountry.sellingPrice;
      productObject["priceWithoutTax"] = priceQuantityCountry.priceWithoutTax;
      productObject["quantity_avail"] = priceQuantityCountry.quantityAvailable;
      productObject["default_attribute_mrp"] = priceQuantityCountry.mrp;
      productObject["mrp"] = priceQuantityCountry.mrp;
      productObject["estimatedDelivery"] =
        priceQuantityCountry.estimatedDelivery;
      productObject["FreeShippingMinAmount"] =
        CONSTANTS.CONST_VAR.FreeShippingMinAmount;
      productObject["productPartDetails"] =
        data.productPartDetails[partReference];
      productObject["taxPercentage"] =
        priceQuantityCountry.taxRule.taxPercentage;
      if (
        priceQuantityCountry.mrp > 0 &&
        productObject["priceWithoutTax"] > 0
      ) {
        disc =
          ((priceQuantityCountry.mrp - productObject["priceWithoutTax"]) /
            priceQuantityCountry.mrp) *
          100;
      }
      productObject["discount"] = disc;
      productObject["outOfStock"] = priceQuantityCountry.outOfStockFlag;

      productObject["attributes"] =
        data.productPartDetails[partReference].attributes;
      productObject["itemCode"] =
        data.productPartDetails[partReference].itemCode;

      let productAllImages = [];
      productObject["productAllImage"] = productAllImages;
      productObject["productImage"] =
        CONSTANTS.IMAGE_BASE_URL +
        data.productPartDetails[partReference].images[0].links.medium;
      productObject["productSmallImage"] =
        CONSTANTS.IMAGE_BASE_URL +
        data.productPartDetails[partReference].images[0].links.small;
      productObject["productZoomImage"] =
        CONSTANTS.IMAGE_BASE_URL +
        data.productPartDetails[partReference].images[0].links.xxlarge;
      productObject["shortDesc"] = data.shortDesc;
      productObject["bulkPriceWithSameDiscount"] =
        priceQuantityCountry.bulkPrices; //no change in discount from api
      if (
        priceQuantityCountry.bulkPrices !== null &&
        priceQuantityCountry.bulkPrices["india"]
      )
        productObject["bulkPrice"] = priceQuantityCountry.bulkPrices["india"];
      else {
        productObject["bulkPrice"] = null;
      }
      if (
        priceQuantityCountry.taxRule &&
        priceQuantityCountry.taxRule.taxPercentage
      ) {
        productObject["taxPercentage"] =
          priceQuantityCountry.taxRule.taxPercentage;
        productObject["sellingPriceWithoutTax"] =
          productObject["price"] / (1 + productObject["taxPercentage"] / 100);
        productObject["tax"] =
          Number(productObject["price"]) -
          Number(productObject["priceWithoutTax"]);
      } else {
        productObject["tax"] = 0;
      }
      this.productResult = productObject;

      if (productObject["bulkPrice"] !== null) {
        productObject["bulkPrice"].forEach((element) => {
          if (priceQuantityCountry.mrp > 0) {
            element.discount =
              ((priceQuantityCountry.mrp - element.bulkSellingPrice) /
                priceQuantityCountry.mrp) *
              100;
          } else {
            element.discount = element.discount;
          }
        });
        this.changeBulkPriceTable();
      }
      this.productResult["categoryCode"] = data.categoryDetails[0].categoryCode;
      this.productResult["categoryName"] = data.categoryDetails[0].categoryName;
      this.productResult["url"] =
        data.productPartDetails[
          productDetail.productBO.partNumber
        ].canonicalUrl;
    
    this.addToCart("/quickorder");
  }

  changeBulkPriceTable() {
    this.productResult["bulkPrice"].forEach((element, index) => {
      if (!element.active) {
        this.productResult["bulkPrice"].splice(index, 1);
      }
    });
    let isvalid: boolean = true;
    let minQty = 0;
    this.productResult["bulkPrice"].forEach((element, index) => {
      if (!element.active) {
        this.productResult["bulkPrice"].splice(index, 1);
      }
    });
    if (this.productResult["bulkPrice"].length > 0) {
      minQty = this.productResult["bulkPrice"][0].minQty;
    }

    this.productResult["bulkPrice"].forEach((element, index) => {
      if (this.productResult["minimal_quantity"] == minQty || !isvalid) {
        isvalid = false;
        element.minQty = element.minQty + 1;
        if (this.productResult["bulkPrice"].length - 1 !== index)
          element.maxQty = element.maxQty + 1;
      }
      if (
        isvalid &&
        this.productResult["minimal_quantity"] > minQty &&
        this.productResult["minimal_quantity"] > 1
      ) {
        element.minQty =
          element.minQty + this.productResult["minimal_quantity"];
        if (this.productResult["bulkPrice"].length - 1 !== index)
          element.maxQty =
            element.maxQty + this.productResult["minimal_quantity"];
      }
    });
  }

  changeBulkPriceQuantity(input) {
    this.bulkPriceSelctedQuatity = 0;
    if (this.productResult["minimal_quantity"] + input >= 1) {
      if (
        this.productResult["bulkPrice"] &&
        this.productResult["bulkPrice"] !== null &&
        this.productResult["bulkPrice"].length > 0
      ) {
        this.bulkSellingPrice = null;
        this.bulkPriceWithoutTax = null;

        let value = this.productResult["minimal_quantity"] + input;
        if (isNaN(value)) {
          value = input;
        }

        let isBulkPriceValid: boolean = false;
        this.productResult["bulkPrice"].forEach((element, index) => {
          if (element.minQty <= value && value <= element.maxQty) {
            isBulkPriceValid = true;
            this.bulkPriceSelctedQuatity = element.minQty;
            this.bulkSellingPrice = element.bulkSellingPrice;
            this.bulkPriceWithoutTax = element.bulkSPWithoutTax;

            let disc = 0;
            if (
              this.productResult["mrp"] > 0 &&
              this.productResult["price"] > 0
            ) {
              disc =
                ((this.productResult["mrp"] - this.bulkSellingPrice) /
                  this.productResult["mrp"]) *
                100;
              this.productResult["discount"] = disc;
            }
          }
          if (
            this.productResult["bulkPrice"].length - 1 == index &&
            value >= element.maxQty
          ) {
            isBulkPriceValid = true;
            this.bulkPriceSelctedQuatity = element.minQty;
            this.bulkSellingPrice = element.bulkSellingPrice;
            this.bulkPriceWithoutTax = element.bulkSPWithoutTax;

            let disc = 0;
            if (
              this.productResult["mrp"] > 0 &&
              this.productResult["price"] > 0
            ) {
              disc =
                ((this.productResult["mrp"] - this.bulkSellingPrice) /
                  this.productResult["mrp"]) *
                100;
              this.productResult["discount"] = disc;
            }
          }
        });
      }
    }
  }

  checkAddToCart(
    itemsList,
    addToCartItem
  ): { itemlist: any; isvalid: boolean } {
    let isOrderValid: boolean = true;
    let addToCartItemIsExist: boolean = false;
    itemsList.forEach((element) => {
      if (addToCartItem.productId === element.productId) {
        addToCartItemIsExist = true;
        let checkProductQuantity =
          element.productQuantity + addToCartItem.productQuantity;
        if (
          checkProductQuantity > Number(this.productResult["quantity_avail"])
        ) {
          element.productQuantity = element.productQuantity;
          this.uniqueRequestNo = 0;
          // alert("No more product is Available");
          isOrderValid = false;
        } else {
          this.changeBulkPriceQuantity(element.productQuantity);
          element.productQuantity =
            element.productQuantity + addToCartItem.productQuantity;
          element.bulkPrice = this.bulkSellingPrice;
          element.bulkPriceWithoutTax = this.bulkPriceWithoutTax;
          element.bulkPriceMap = this.productResult[
            "bulkPriceWithSameDiscount"
          ];
          element.taxes = element.productQuantity * this.productResult["tax"];
        }

        element.totalPayableAmount =
          element.totalPayableAmount + addToCartItem.totalPayableAmount;
        element.tpawot =
          element.priceWithoutTax + addToCartItem.priceWithoutTax;
      }
    });
    if (!addToCartItemIsExist) {
      if (
        addToCartItem.productQuantity >
        Number(this.productResult["quantity_avail"])
      ) {
        this.uniqueRequestNo = 0;
        // alert("Product is out of stock");
        isOrderValid = false;
      } else if (
        !isNaN(this.productResult["minimal_quantity"]) &&
        this.productResult["minimal_quantity"] <
          this.productResult["minimal_quantity"]
      ) {
        // alert(
        //   "order quantity should be greater than " +
        //     this.productResult["minimal_quantity"]
        // );
        isOrderValid = false;
        this.uniqueRequestNo = 0;
      } else if (
        !isNaN(this.productResult["minimal_quantity"]) &&
        this.productResult["minimal_quantity"] >=
          this.productResult["minimal_quantity"]
      ) {
        this.changeBulkPriceQuantity(0);
        addToCartItem.bulkPrice = this.bulkSellingPrice;
        addToCartItem.bulkPriceWithoutTax = this.bulkPriceWithoutTax;
        addToCartItem.bulkPriceMap = this.productResult[
          "bulkPriceWithSameDiscount"
        ];
        itemsList.push(addToCartItem);
      } else {
        this.changeBulkPriceQuantity(0);
        addToCartItem.bulkPrice = this.bulkSellingPrice;
        addToCartItem.bulkPriceWithoutTax = this.bulkPriceWithoutTax;
        addToCartItem.bulkPriceMap = this.productResult[
          "bulkPriceWithSameDiscount"
        ];
        itemsList.push(addToCartItem);
      }
    }
    return { itemlist: itemsList, isvalid: isOrderValid };
  }

  getSession() {
    let userSession = this._localAuthService.getUserSession();
    this.userSession = userSession;

    if (userSession) {
      let params = { sessionid: userSession.sessionId };
      this._productService.getCartBySession(params).subscribe((res) => {
        if (res["statusCode"] == 200) {
          this.getPurcahseList();
          this.sessionDetails = res;
        }
      });
    } else {
      this._productService.getSession().subscribe((session) => {
        this._localAuthService.setUserSession(session);
        this.getPurcahseList();
        if (
          session["statusCode"] != undefined &&
          session["statusCode"] == 500
        ) {
          alert(session);
        } else {
          let params = { sessionid: session["sessionId"] };
          this._productService.getCartBySession(params).subscribe((cartRes) => {
            if (cartRes["statusCode"] == 200) {
              this.sessionDetails = cartRes;
            }
          });
        }
      });
    }
  }

  addToCart(routerlink) {
    if (this.uniqueRequestNo == 0) {
      this.uniqueRequestNo = 1;

      let quantity = this.productResult["minimal_quantity"];
      let sessionCartObject;
      if (this.sessionDetails.cart) {
        sessionCartObject = this.sessionDetails.cart;
        this.addProductInCart(routerlink, sessionCartObject, quantity);
      } else {
        this.commonService.getUserSession().subscribe((res) => {
          if (res["statusCode"] != undefined && res["statusCode"] == 500) {
          } else {
            this._localAuthService.setUserSession(res);
            let userSession = this._localAuthService.getUserSession();
            let params = { sessionid: userSession.sessionId };
            this.cartService
              .getCartBySession(params)
              .subscribe((cartSession) => {
                if (
                  cartSession["statusCode"] != undefined &&
                  cartSession["statusCode"] == 200
                ) {
                  this.cartService.orderSummary.next(cartSession);
                  this.sessionDetails = cartSession;
                  sessionCartObject = this.sessionDetails.cart;
                  this.cartService.cart.next({count: (cartSession["cart"] != undefined ? cartSession["noOfItems"] : 0)});
                  this.addProductInCart(
                    routerlink,
                    sessionCartObject,
                    quantity
                  );
                }
              });
          }
        });
      }
    }
  }

  addProductInCart(routerLink, sessionCartObject, quantity) {
    let sessionItemList: Array<any> = [];
    let sessionDetails = this.cartService.getGenericCartSession;
    if (sessionDetails["itemsList"] == null) {
      sessionItemList = [];
    } else {
      sessionItemList = sessionDetails["itemsList"];
    }
    let singleProductItem = {
      cartId: sessionCartObject.cartId,
      productId: this.productResult["partNumber"],
      createdAt: new Date(),
      updatedAt: new Date(),
      amount: Number(this.productResult["mrp"]),
      offer: null,
      amountWithOffer: null,
      taxes: Number(this.productResult["tax"]),
      amountWithTaxes: null,
      totalPayableAmount: Number(this.productResult["price"]),
      productName: this.productResult["productName"],
      brandName: this.productResult["brand"],
      productMRP: this.productResult["mrp"],
      priceWithoutTax: this.productResult["priceWithoutTax"],
      tpawot: Number(this.productResult["priceWithoutTax"]),
      taxPercentage: Number(this.productResult["taxPercentage"]),
      productSelling: this.productResult["price"],
      discount: this.productResult["discount"],
      productImg: this.productResult["productSmallImage"],
      isPersistant: true,
      productQuantity: Number(quantity),
      productUnitPrice: Number(this.productResult["price"]),
      expireAt: null,
      productUrl: this.productResult["url"],
      bulkPriceMap: this.productResult["bulkPriceWithSameDiscount"],
      bulkPrice: this.bulkSellingPrice,
      bulkPriceWithoutTax: this.bulkPriceWithoutTax,
    };

    let checkAddToCartData = this.checkAddToCart(
      sessionItemList,
      singleProductItem
    );
    if (checkAddToCartData.isvalid) {
      this.showLoader = true;
      sessionDetails["itemsList"] = checkAddToCartData.itemlist;
      sessionDetails = this.cartService.generateGenericCartSession(sessionDetails);
      this.cartService.setGenericCartSession(sessionDetails);
    }
  }

  updateCartSessions(routerLink) {
    let sessionDetails = this.cartService.getGenericCartSession;
    this.showLoader = true;
    let cartObject = {
      cart: sessionDetails["cart"],
      itemsList: sessionDetails["itemsList"],
      addressList: sessionDetails["addressList"],
      payment: sessionDetails["payment"],
      deliveryMethod: sessionDetails["deliveryMethod"],
      offersList: sessionDetails["offersList"],
    };

    this.cartService.updateCartSession(cartObject).subscribe(
      (data) => {
        this.showLoader = false;
        this._tms.show({ type: "success", text: "Successfully added to cart" });
        if (data.status) {
          this.sessionDetails = data;
          this.uniqueRequestNo = 0;
          this.cartService.setGenericCartSession(data);
          this.cartService.cart.next({count: data["noOfItems"]});
          this.successMessage = this.selectedIndex;
        } else {
          this.uniqueRequestNo = 0;
        }
      },
      (err) => {
        this._tms.show({ type: "success", text: "Cannot add to cart." });
        this.uniqueRequestNo = 0;
        this.showLoader = false;
      }
    );
  }

  removePromoCode() {
    let cartSession = this.cartService.getGenericCartSession;
    cartSession["offersList"] = [];
    cartSession["extraOffer"] = null;
    cartSession["cart"]["totalOffer"] = 0;

    let itemsList = cartSession["itemsList"];
    itemsList.forEach((element, index) => {
      cartSession["itemsList"][index]["offer"] = null;
    });
    this.cartService.setGenericCartSession(cartSession);
  }

  applyPromoCode(routerLink) {
    this.showLoader = true;
    if (this.localStorageService.retrieve("user")) {
      let userData = this.localStorageService.retrieve("user");
      if (userData.authenticated == "true") {
        if (this.sessionDetails["offersList"]) {
          let reqobj = {
            shoppingCartDto: this.sessionDetails,
          };

          this.orderSummaryService.applyPromoCode(reqobj).subscribe((res) => {
            this.showLoader = false;
            if (res["status"]) {
              if (
                res["data"]["discount"] <=
                this.sessionDetails["cart"]["totalAmount"]
              )
                this.sessionDetails["cart"]["totalOffer"] =
                  res["data"]["discount"];
              else {
                this.sessionDetails["cart"]["totalOffer"] = 0;
                this.sessionDetails["offersList"] = [];
              }
              this.updateCartSessions(routerLink);
            } else {
              this.sessionDetails["cart"]["totalOffer"] = 0;
              this.sessionDetails["offersList"] = [];
              this.updateCartSessions(routerLink);
            }
          });
        } else {
          this.showLoader = false;
          this.updateCartSessions(routerLink);
        }
      }
      if (userData.authenticated == "false") {
        this.showLoader = false;
        this.updateCartSessions(routerLink);
      }
    } else {
      this.showLoader = false;
      this.updateCartSessions(routerLink);
    }
  }

  removeItemFromPurchaseList(productObject) {
    this.showLoader = true;
    let userSession = this._localAuthService.getUserSession();

    let obj = {
      idUser: userSession.userId,
      userType: "business",
      idProduct: productObject.partNumber,
      productName: productObject.productName,
      description: productObject.desciption,
      brand: productObject.brandDetails.brandName,
      category: productObject.categoryDetails.categoryCode,
    };

    this._businessPurchaseListService.removePurchaseList(obj).subscribe(
      (res) => {
        if (res["status"]) {
          dataLayer.push({
            event: "removeFromPurchaseList",
          });
          this.getPurcahseList();
        } else {
          this.showLoader = false;
        }
      },
      (err) => {
        this.showLoader = false;
      }
    );
    this.spp = false;
  }

  aori(ele, productDetail) {
    if (ele && ele.checked) {
      this.spli.push(productDetail);
    } else {
      let index = this.spli.indexOf(productDetail);
      this.spli.splice(index, 1);
    }
  }
  addNow(productDetail) {
    this.spli = [];
    this.spli.push(productDetail);
    this.getdata(this.spli);
  }
  showBox(ele) {
    this.elementIndex = ele;
    this.spp = true;
  }
  discountPrice(markedPrice, sellingPrice) {
    if (!markedPrice) {
      return 0;
    }
    const discount = markedPrice - sellingPrice;
    const discountPercentage = (discount / markedPrice) * 100;
    const roundOff = Math.floor(discountPercentage); // Round off to two digits after decimal.
    return roundOff;
  }
}