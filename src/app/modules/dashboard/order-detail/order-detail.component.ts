import { Subject, Subscription } from "rxjs";
import { ActivatedRoute, Params, Router } from "@angular/router";
import {
  Component,
  OnInit,
  ViewChild,
  EventEmitter,
  Output,
  ViewContainerRef,
  ComponentFactoryResolver,
  Injector,
  OnDestroy,
} from "@angular/core";
import { debounceTime, map, takeUntil } from "rxjs/operators";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { DatePipe, formatDate } from "@angular/common";
import { Bank } from "../../../utils/validators/bank.validate";
import { TrackOrderComponent } from "./track-order/track-order.component";
import { LocalStorageService } from "ngx-webstorage";
import { ModalService } from "@app/modules/modal/modal.service";
import { LocalAuthService } from "@app/utils/services/auth.service";
import CONSTANTS from "@app/config/constants";
import { PopUpComponent } from "@app/modules/popUp/pop-up.component";
import { ToastMessageService } from "@app/modules/toastMessage/toast-message.service";
import { OrderDetailService } from "./order-detail.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { CommonService } from "@app/utils/services/common.service";

declare var digitalData: {};
declare let _satellite;

@Component({
  selector: "app-order-detail",
  templateUrl: "./order-detail.component.html",
  styleUrls: [
    "./order-detail.component.scss",
    "../bussiness-order/businessOrder.scss",
  ],
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(PopUpComponent) _popupComponent: PopUpComponent;
  cancelReasons: Array<{}>;
  reason_id: any;
  commentsOrderCancelText: any;
  status: any;
  priceOfProduct: any;
  user: { authenticated: string };
  openPopup: string;
  openCancel: boolean;
  orderId: any;
  productDescriptionName: any;
  detail: any;
  orderDetailsJson: any;
  customerId: any;
  itemId: any;
  spp: boolean;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  today: number = Date.now();
  currentDate: number;
  accepted: number;
  confirmed: number;
  delivered: number;
  shipped: number;
  openAlert: boolean = false;
  orderDetail: any;
  pageUrl: string = window.location.pathname;
  pageSize = 10;
  pages: number = 0;
  pagesArray: any = [];
  itemIdParam: any;
  trackOrderBoxDetail: any = {};
  returnForm: FormGroup;
  step: number;
  cancel_step: number;
  imgDisable: boolean = false;
  returnReasons: Array<{}>;
  showFileError: boolean;
  returnEndDate: any;
  showReturn: boolean;
  customerReturn: boolean = false;
  trackStatusKeyName = {
    accepted: "Accepted",
    confirmed: "Processed",
    packed: "Packed",
    shipped: "Shipped",
    delivered: "Delivered",
    eDelivery: "Estimated Delivery",
    exchange_delivered: "Delivered",
    exchange_re_ex_requested: "Exchange Requested",
    exchange_re_ex_approved: "Exchange Approved",
    exchange_re_ex_picked: "Exchange Picked",
    return_delivered: "Delivered",
    return_re_ex_requested: "Return Requested",
    return_re_ex_approved: "Return Approved",
    return_re_ex_picked: "Return Picked",
    return_return_done: "Return Done",
    forwardR_delivered: "Delivered",
    forwardR_re_ex_requested: "Return Requested",
    forwardR_re_ex_rejected: "Rejected",
    forwardE_delivered: "Delivered",
    forwardE_re_ex_requested: "Exchange Requested",
    forwardE_re_ex_rejected: "Rejected",
  };
  itemImages: Array<{}>;
  chequeImage: {};
  statusListForReturnExchange = [
    "EXCHANGE REQUESTED",
    "EXCHANGE REJECTED",
    "RETURN REQUESTED",
    "RETURN REJECTED",
    "EXCHANGE APPROVED",
    "EXCHANGE PICKED",
    "RETURN APPROVED",
    "RETURN PICKED",
    "RETURN DONE",
  ];
  private cDistryoyed = new Subject();
  isBrandMsn: boolean;
  set showLoader(value) {
    this.loaderService.setLoaderState(value);
  }
  // ondemand loaded component for return info
  returnInfoInstance = null;
  @ViewChild("returnInfo", { read: ViewContainerRef })
  returnInfoContainerRef: ViewContainerRef;

  savedBankDetailInfo;
  bankDetailInfoForm: FormGroup;
  showConfirmOnDirectSub = false;
  ifscSubscription: Subscription = null;

  readonly validBuyAgainStatus = [
    "SHIPPED",
    "DELIVERED",
    "RETURN REQUESTED",
    "RETURN REJECTED",
    "RETURN APPROVED",
    "RETURN PICKED",
    "RETURN DONE",
    "EXCHANGE REQUESTED",
    "EXCHANGE REJECTED",
    "EXCHANGE APPROVED",
    "EXCHANGE PICKED",
  ];
  readonly validTrackingStatus = ["SHIPPED", "DELIVERED"];
  readonly trackingMessage =
    "Tracking information from courier partner is not available at the moment.";
  readonly imageAssetURL = CONSTANTS.IMAGE_ASSET_URL;
  constructor(
    private datePipe: DatePipe,
    private _formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private _OrderService: OrderDetailService,
    private _localAuthService: LocalAuthService,
    private _router: Router,
    private _tms: ToastMessageService,
    private _modalService: ModalService,
    private _commonService: CommonService,
    public localStorageService: LocalStorageService,
    private loaderService: GlobalLoaderService,
    private cfr: ComponentFactoryResolver,
    private injector: Injector
  ) {
    this.showLoader = true;
    this.showFileError = false;
    this.openCancel = false;
    this.returnReasons = [];
    this.itemImages = [];
    this.step = 1;
  }

  ngOnInit() {
    this.orderDetail = [];
    this.user = this._localAuthService.getUserSession();
    this.route.params.subscribe((params: Params) => {
      this.orderId = params["id"];
      this.itemIdParam = params["itemid"];
    });

    this.getOrderDetail(this.orderId);

    this._OrderService.getCancelReasons().subscribe((cancelReasons) => {
      if (
        cancelReasons != undefined &&
        cancelReasons != null &&
        Array.isArray(cancelReasons)
      ) {
        this.cancelReasons = cancelReasons;
      }
    });
    this.ifscSubscription = this.returnForm.controls["bankDetail"]["controls"][
      "ifscCode"
    ].valueChanges
      .pipe(debounceTime(300))
      .subscribe((res) => {
        if (
          this.returnForm.controls["bankDetail"]["controls"]["ifscCode"].value
            .length == 11
        ) {
          this.getBankNameByIfscCode(res);
        } else {
          this.returnForm.controls["bankDetail"]["controls"][
            "bankName"
          ].reset();
        }
      });
  }

  showReturnHandler(deliveryDate) {
    // console.log('deliveryDate ==>', deliveryDate);
    let currDate = new Date();
    const newdeliveryDate = new Date(deliveryDate);
    const handleNegativeYear =
      newdeliveryDate.getFullYear() < 0
        ? newdeliveryDate.getFullYear() * -1
        : newdeliveryDate.getFullYear();
    let date2 = new Date(
      handleNegativeYear,
      newdeliveryDate.getMonth(),
      newdeliveryDate.getDate()
    );

    const diffTime = Math.abs(currDate.getTime() - date2.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 2 && this.isBrandMsn) {
      return true;
    } else if (diffDays <= 8 && !this.isBrandMsn) {
      return true;
    }
    return false;
  }

  getReturnReasons(deliveryDate) {
    const currDate: any = new Date();
    deliveryDate = new Date(deliveryDate);

    const currentDate = new Date(
      `${
        currDate.getMonth() + 1
      }/${currDate.getDate()}/${currDate.getFullYear()}`
    );
    const oldDate = new Date(
      `${deliveryDate.getMonth() + 1}/${deliveryDate.getDate()}/${Math.abs(
        deliveryDate.getFullYear()
      )}`
    );

    const diffTime = Math.abs(currentDate.getTime() - oldDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 2) {
      return [
        { id: 2, text: "Received wrong item" },
        { id: 1, text: "Product Damaged/Item Broken" },
        { id: 3, text: "Parts or Accessories missing" },
        { id: 4, text: "Item is defective" },
      ];
    }
    return [
      // { id: 3, text: 'Parts or Accessories missing' },
      { id: 4, text: "Item is defective" },
    ];
  }

  getDataforCancel(product_name, price, customer_id, item_id, status) {
    this.customerId = customer_id;
    this.itemId = item_id;
    this.productDescriptionName = product_name;
    this.priceOfProduct = price;
    this.status = status;
    this.cancel_step = 1;
  }

  totalPrice(price, qty, shippingCharge, couponDiscount) {
    const sumTotal = price * qty + shippingCharge - couponDiscount;
    return sumTotal;
  }

  changeRequestType(event) {
    if (
      event.target.value == "exchange" ||
      (this.detail["payment_type"] != "COD" &&
        this.detail["payment_type"] != "NEFT")
    ) {
      this.returnForm.removeControl("bankDetail");
    } else {
      this.returnForm.setControl(
        "bankDetail",
        this._formBuilder.group({
          bankName: [
            null,
            { validators: [Validators.required, Bank.bankNameorAccountHolder] },
          ],
          ifscCode: [
            null,
            {
              validators: [
                Validators.required,
                Validators.pattern("^[A-Z]{4}0[A-Z0-9]{6}$"),
              ],
            },
          ],
          // "ifscCode": [null, { validators: [Validators.required, Validators.pattern('^[0-9]{6}$')]}],
          acountName: [
            null,
            { validators: [Validators.required, Bank.bankNameorAccountHolder] },
          ],
          acountNo: [
            null,
            { validators: [Validators.required, Bank.bankAccount] },
          ],
          userId: [this.user["userId"]],
          id: [null],
          chequeUrl: [null],
        })
      );

      this.returnForm.controls["bankDetail"]["controls"][
        "ifscCode"
      ].valueChanges
        .pipe(debounceTime(300))
        .subscribe((res) => {
          if (
            this.returnForm.controls["bankDetail"]["controls"]["ifscCode"].value
              .length == 11
          ) {
            this.getBankNameByIfscCode(res);
          } else {
            this.returnForm.controls["bankDetail"]["controls"][
              "bankName"
            ].reset();
          }
        });
    }
  }

  savedCardBankDetail() {
    if (this.user["userId"]) {
      this._OrderService
        .getSavedCardDetails(this.user["userId"])
        .subscribe((res) => {
          if (res["status"]) {
            let data = res["data"];
            this.savedBankDetailInfo = data;
          }
        });
    }
  }

  onSavedBankDetailSelecion(data) {
    const nestedbankDetailForm = this.returnForm.get("bankDetail") as FormGroup;
    this.returnForm.controls["bankDetail"]["controls"]["bankName"].setValue(
      data.bankName
    );
    this.returnForm.controls["bankDetail"]["controls"]["ifscCode"].setValue(
      data.ifscCode
    );
    this.returnForm.controls["bankDetail"]["controls"]["acountName"].setValue(
      data.username
    );
    this.returnForm.controls["bankDetail"]["controls"]["acountNo"].setValue(
      data.accountNumber
    );
    // this.returnForm.controls['bankDetail']['controls']['id'].setValue(data.id)
    nestedbankDetailForm.removeControl("id");
    this.showConfirmOnDirectSub = true;
  }

  addAnotherBankDetail() {
    if (
      this.returnForm.controls["quantity"].valid &&
      this.returnForm.controls["reason"].valid &&
      this.returnForm.controls["requestType"].valid &&
      this.itemImages.length > 0
    ) {
      this.returnForm.controls["bankDetail"]["controls"]["bankName"].setValue(
        ""
      );
      this.returnForm.controls["bankDetail"]["controls"]["ifscCode"].setValue(
        ""
      );
      this.returnForm.controls["bankDetail"]["controls"]["acountName"].setValue(
        ""
      );
      this.returnForm.controls["bankDetail"]["controls"]["acountNo"].setValue(
        ""
      );
      this.step = 2;
    } else {
      this._tms.show({
        type: "error",
        text: "Please Enter the above mandatory field",
      });
    }
  }

  onEditBankDetailSelecion(data) {
    if (
      this.returnForm.controls["quantity"].valid &&
      this.returnForm.controls["reason"].valid &&
      this.returnForm.controls["requestType"].valid &&
      this.itemImages.length > 0
    ) {
      this.returnForm.controls["bankDetail"]["controls"]["bankName"].setValue(
        data.bankName
      );
      this.returnForm.controls["bankDetail"]["controls"]["ifscCode"].setValue(
        data.ifscCode
      );
      this.returnForm.controls["bankDetail"]["controls"]["acountName"].setValue(
        data.username
      );
      this.returnForm.controls["bankDetail"]["controls"]["acountNo"].setValue(
        data.accountNumber
      );
      this.returnForm.controls["bankDetail"]["controls"]["id"].setValue(
        data.id
      );
      this.step = 2;
    } else {
      this._tms.show({
        type: "error",
        text: "Please Enter the above mandatory field",
      });
    }
  }

  deleteBankDetailSelecion(data) {
    if (this.user["userId"]) {
      this._OrderService
        .deleteSavedCardDetails(data.id, this.user["userId"])
        .subscribe((res) => {
          if (res["status"] && res["statusDescription"] == "Deleted") {
            this._tms.show({
              type: "success",
              text: "saved Bank detail deleted successfully",
            });
            this.savedCardBankDetail();
          } else
            this._tms.show({
              type: "error",
              text: "Failed to delete bank details",
            });
        });
    }
  }

  getBankNameByIfscCode(ifscCode) {
    this._OrderService.getIfscAndBankName(ifscCode).subscribe((res) => {
      if (res["status"]) {
        this.returnForm.controls["bankDetail"]["controls"]["bankName"].reset();
        // console.log("result",res)
        const bankNameByIfscApi = res["data"]["BANK"];
        this.returnForm.controls["bankDetail"]["controls"]["bankName"].setValue(
          bankNameByIfscApi
        );
      } else {
        this.returnForm.controls["bankDetail"]["controls"]["bankName"].reset();
      }
    });
  }

  get showError() {
    return this.returnForm.controls?.reason?.value == "Item is defective" &&
      this.isBrandMsn
      ? true
      : false;
  }

  createReturnForm(oDetail) {
    this.returnForm = this._formBuilder.group({
      requestType: [null, [Validators.required]],
      productImage: [null],
      reason: [null, [Validators.required]],
      quantity: [
        null,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(parseInt(oDetail["Quantity"])),
        ],
      ],
      comment: [],
    });
  }

  getOrderDetail(orderId) {
    this.showLoader = true;
    this._OrderService
      .getOrderDetail(orderId, this.user["userId"])
      .pipe(
        map((cr) => {
          if (
            cr != undefined &&
            cr != null &&
            cr != "" &&
            Array.isArray(cr) &&
            cr.length > 0
          ) {
            for (let i = 0; i < cr.length; i++) {
              cr[i]["cancelReasonId"] = "";
              cr[i]["showTrackOrder"] = false;
              cr[i]["isCanceled"] = false;
            }
          }
          return cr;
        })
      )
      .subscribe((res: any) => {
        this.showLoader = false;
        this.orderDetail[orderId] = res;
        res.map((item) => {
          if (item.item_id === this.itemIdParam) {
            this.detail = item;
            this._OrderService
              .fetchItemDetails(item.product_msn)
              .subscribe((resp) => {
                if (resp && resp["status"]) {
                  this.isBrandMsn =
                    resp["productBO"]["brandDetails"]["brandTag"] == "Brand"
                      ? true
                      : false;
                  if (this.detail && this.detail.dates.delivered.date) {
                    this.showReturn = this.showReturnHandler(
                      this.detail.dates.delivered.date
                    );
                    let deliveryDate = new Date(item.dates.delivered.date);
                    let number = this.isBrandMsn ? 2 : 7;
                    let crrDate = new Date(
                      deliveryDate.getFullYear(),
                      deliveryDate.getMonth(),
                      deliveryDate.getDate() + number
                    );
                    this.returnEndDate = this.getFomrattedDate(
                      crrDate.getFullYear(),
                      crrDate.getMonth(),
                      crrDate.getDate()
                    );
                  }
                }
              });
            this.returnReasons = this.getReturnReasons(
              item.dates.delivered.date
            );
            // const mydate = new Date(item.dates.delivered.date);
            // console.log('this.returnEndDate', item.dates.delivered.date, deliveryDate, crrDate, this.returnEndDate);
            this.createReturnForm(item);
            this.setDataForTracData(item);
          }
        });

        if (!this.detail) {
          this.detail = res[0];
        }
        const aDate = this.detail.dates.accepted.date.split("-");
        let newDate = aDate[1] + "," + aDate[0] + "," + aDate[2];
        this.accepted = new Date(newDate).getTime();

        const cDate = this.detail.dates.confirmed.date.split("-");
        newDate = cDate[1] + "," + cDate[0] + "," + cDate[2];
        this.confirmed = new Date(newDate).getTime();

        const dDate = this.detail.dates.delivered.date.split("-");
        newDate = cDate[1] + "," + cDate[0] + "," + cDate[2];
        this.delivered = new Date(newDate).getTime();

        const sDate = this.detail.dates.shipped.date.split("-");
        newDate = sDate[1] + "," + sDate[0] + "," + sDate[2];
        this.shipped = new Date(newDate).getTime();
        this.currentDate = this.today;
      });
  }

  getFomrattedDate(yyyy, mm, dd) {
    mm = +mm + 1;
    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;
    return dd + "-" + mm + "-" + (yyyy < 0 ? yyyy * -1 : yyyy);
  }

  setDataForTracData(detail) {
    let trackOrderBoxDetail: any = {};
    if (detail && detail.dates && detail.requestType !== "cancel") {
      if (detail.requestType === "forward") {
        trackOrderBoxDetail.firstDate = detail.dates.accepted.date;
        trackOrderBoxDetail.firstDateLabel = "Ordered & Approved";

        if (
          detail.status !== "RETURN REJECTED" &&
          detail.status !== "EXCHANGE REJECTED"
        ) {
          trackOrderBoxDetail.lastDateLabel = "Delivered:";
          if (
            detail.status === "SHIPPED" ||
            detail.status === "ACCEPTED" ||
            detail.status === "PROCESSING" ||
            detail.status === "PACKED"
          ) {
            trackOrderBoxDetail.lastDateLabel = "Estimated Delivery:";
          }

          /**
           * TODO:CORONA
           * Removed below if condition after 45 days
           */

          // console.log(value[key]['date']);
          //  ;
          let accepted = new Date(detail["dates"]["accepted"]["date"]);
          let lastOrderDate = new Date("10-Mar-2020");

          const diffTime = lastOrderDate.getTime() - accepted.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays < 0) {
            trackOrderBoxDetail.lastDate = "";
          } else {
            trackOrderBoxDetail.lastDate = detail.dates.delivered.date;
          }
          // Corona code ends

          trackOrderBoxDetail.lastDate = detail.dates.delivered.date;
          trackOrderBoxDetail.lastDateFlag = detail.dates.delivered.flag;
        } else {
          trackOrderBoxDetail.lastDateLabel = "Rejected:";
          trackOrderBoxDetail.lastDate = detail.dates.re_ex_rejected.date || "";
          trackOrderBoxDetail.lastDateFlag = true;
        }
      } else {
        if (
          detail &&
          detail.status === "RETURN DONE" &&
          detail.dates.delivered.flag == false
        ) {
          this.customerReturn = true;
          // console.log("hello");
        }
        trackOrderBoxDetail.firstDate = detail.dates.delivered.date;
        trackOrderBoxDetail.firstDateLabel = "Delivered";
        trackOrderBoxDetail.lastDate =
          detail.requestType === "return"
            ? detail.dates.return_done.date
            : detail.dates.re_ex_picked.date;
        trackOrderBoxDetail.lastDateLabel =
          detail.requestType === "return" ? "Return Done:" : "Exchange Picked";
        if (detail.requestType === "return") {
          trackOrderBoxDetail.lastDateFlag = detail.dates.return_done.flag;
        }
      }
      this.trackOrderBoxDetail = trackOrderBoxDetail;
    }
  }
  cancelOrder(reason_id, customerId, itemId) {
    let detail = {
      cancelReasonId: reason_id,
      customer_id: customerId,
      item_id: itemId,
    };

    if (
      detail.cancelReasonId == undefined ||
      detail.cancelReasonId == null ||
      detail.cancelReasonId == ""
    )
      return;
    let data = {
      customer_id: detail.customer_id,
      item_id: detail.item_id,
      reason_id: detail.cancelReasonId,
    };
    this._OrderService.cancelOrder(data).subscribe((response) => {
      this.cancel_step = 2;
      for (let i = 0; i < this.orderDetail[this.orderId].length; i++) {
        if (this.orderDetail[this.orderId][i]["item_id"] == detail["item_id"]) {
          this.orderDetail[this.orderId][i]["isCanceled"] = true;
          this.detail.status = "CANCELLED";
          this.detail.requestType = "cancel";
        }
      }

      setTimeout(() => {
        this.openCancel = true;
      }, 100);
    });
  }

  navigateTo(route) {
    this._router.navigate([route]);
  }

  toMyOrdersPage(route) {
    this._router.navigate([route]);
  }

  outData(data) {
    this[data.selector] = !this[data.selector];
    if (data && data.hide) {
      this.openPopup = null;
      this.step = 1;
      this.reason_id = null;
      this.resetReturnRefund();
    }
  }

  resetReturnRefund() {
    this.step = 1;
    this.itemImages = [];
    this.chequeImage = null;
    this.returnForm.reset();
  }

  customClose() {
    this._popupComponent.closePopup();
  }

  returnProduct(rData, valid) {
    // console.log('returnProduct', rData, valid);
    // return;

    this.showConfirmOnDirectSub = false;
    rData.itemId = this.detail.item_id;
    rData.msn = this.detail.product_msn;

    rData.productImage = [];
    if (this.itemImages && this.itemImages.length > 0) {
      let i = 0;
      while (i < this.itemImages.length) {
        rData.productImage.push(this.itemImages[i]["url"]);
        i++;
      }
    }

    if (this.chequeImage) {
      rData.bankDetail.chequeUrl = this.chequeImage["url"];
    }
    rData.reasonId = 0;
    rData.quantity = parseInt(rData.quantity);

    this.getRefundTransactionId(rData, this.user["userId"]);
  }

  getRefundTransactionId(rData, userId) {
    if (rData && userId) {
      this._OrderService
        .getTransactionId({ userId: userId })
        .subscribe((res) => {
          if (res && res["status"]) {
            rData.transactionId = res["data"]["transactionId"];
            rData.orderId = this.detail.order_id;
            this.returnRefund(rData);
          }
        });
    }
  }

  returnRefund(rData) {
    if (rData) {
      this._OrderService.returnItem(rData).subscribe((res) => {
        if (res["status"]) {
          if (this.detail["item_id"] == rData["itemId"]) {
            for (let i = 0; i < this.orderDetail[this.orderId].length; i++) {
              if (
                this.orderDetail[this.orderId][i]["item_id"] ==
                this.detail["item_id"]
              ) {
                this.detail.requestType = rData.requestType;

                if (rData.requestType == "return") {
                  this.step = 3;
                  this.detail.status = "RETURN REQUESTED";
                } else if (rData.requestType == "exchange") {
                  this._tms.show({
                    type: "success",
                    text: "Exchange Requested",
                  });
                  this.detail.status = "EXCHANGE REQUESTED";
                  this.customClose();
                }

                this.detail.dates["re_ex_requested"] = {
                  date: this.datePipe.transform(new Date(), "dd-MMM-yyyy"),
                  flag: true,
                };
                this.detail.dates["re_ex_approved"] = { date: "", flag: false };
                this.detail.dates["re_ex_picked"] = { date: "", flag: false };
                if (rData.requestType == "return") {
                  this.detail.dates["return_done"] = { date: "", flag: false };
                }
                this.setDataForTracData(this.detail);
              }
            }
          }
        }
      });
    }
  }

  addItemImage(event) {
    this.showLoader = true;
    if (this.itemImages.length == 8) {
      return;
    }

    const fData = new FormData();
    fData.append("productImage", event.target.files[0]);
    this._OrderService.uploadImage(fData).then((res) => {
      this.showFileError = false;
      this.itemImages.push({
        file: event.target.files[0],
        url: JSON.parse(res["response"])["data"],
      });
      this.showLoader = false;
    });
  }

  addChequeImage(event) {
    this.chequeImage = null;
    const fData = new FormData();
    fData.append("productImage", event.target.files[0]);

    this._OrderService.uploadImage(fData).then((res) => {
      this.showFileError = false;
      this.chequeImage = {
        file: event.target.files[0],
        url: JSON.parse(res["response"])["data"],
      };
    });
  }

  removeItemImage(i) {
    this.itemImages.splice(i, 1);
    if (this.itemImages.length) {
      this.showFileError = false;
    } else {
      this.showFileError = true;
    }
    this.returnForm.controls["productImage"].setValue(null);
  }

  removeChequeImage() {
    this.chequeImage = null;
    this.returnForm.controls["bankDetail"]["controls"]["chequeUrl"].setValue(
      null
    );
  }

  groupByDateKeys: any[] = [];
  groupByDate = null;
  orderScanMsg = "";
  shipmentDetail = null;
  currentItemStatus = null;
  estimatedDelivery = null;

  /**
   * @description to fetch tracking as per item details
   * @param detail : item details
   */
  fetchTrackingData(itemDetails) {
    // console.log(itemDetails);
    let status = (itemDetails["status"] as string).trim().toUpperCase();
    itemDetails["hasInfo"] = false;

    if (this.validTrackingStatus.indexOf(status) == -1) {
      this.spp = true;
    } else {
      this.showLoader = true;
      this._OrderService
        .getOrderTracking(itemDetails["shipment_detail"]["shipment_id"])
        .pipe(takeUntil(this.cDistryoyed))
        .subscribe(
          (response) => {
            this.processTrackingResponse(response, itemDetails);
          },
          (error) => {
            this.processTrackingError(error, itemDetails);
          }
        );
    }
  }

  /**
   * @description to process the request on success
   * @description desceding order, grouping on date
   * @param response
   * @param detail : item details
   */
  processTrackingResponse(response, itemDetails) {
    let lOrderScans: any[] = response["orderScans"] as any[];

    itemDetails["customMsg"] = response["message"];
    if (lOrderScans) {
      lOrderScans = lOrderScans.reverse();
      let lastEstDeliveryindex = -1;
      let deliveryIndex = -1;
      lOrderScans.forEach((scanObject, scanIndex) => {
        let status: string = scanObject["status"];
        lOrderScans[scanIndex]["mDate"] = formatDate(
          scanObject["statusUpdateTime"],
          "yyyy-MM-dd",
          "en-IN"
        );
        if (status.toLowerCase() === "out for delivery") {
          lastEstDeliveryindex = scanIndex;
        }
        if (status.toLowerCase() === "delivered") {
          deliveryIndex = scanIndex;
        }
      });
      if (deliveryIndex > -1) {
        itemDetails["dates"]["delivered"]["date"] =
          lOrderScans[deliveryIndex]["mDate"];
      }
      itemDetails["lastOutForDelivery"] = null;
      if (lastEstDeliveryindex > -1 && deliveryIndex > -1) {
        if (
          lOrderScans[deliveryIndex]["mDate"] ===
          lOrderScans[lastEstDeliveryindex]["mDate"]
        ) {
          itemDetails["lastOutForDelivery"] =
            lOrderScans[deliveryIndex]["mDate"];
        }
        lOrderScans.splice(deliveryIndex, 1);
      }
      itemDetails["groupByDate"] = this._OrderService.groupBy(
        lOrderScans,
        "mDate"
      );
      itemDetails["groupByDateKeys"] = Object.keys(itemDetails["groupByDate"]);
      itemDetails["hasInfo"] = true;
    } else {
      itemDetails["hasInfo"] = false;
      itemDetails["customMsg"] = this.trackingMessage;
    }
    this.orderTrackingPopup(itemDetails);
    this.showLoader = false;
  }

  //Conditional Array Insertion
  insertIf(condition, ...elements) {
    return condition ? elements : [];
  }

  /**
   * @description to process the request on failure
   * @param error
   * @param detail : item details
   */

  processTrackingError(error, itemDetails) {
    itemDetails["customMsg"] = this.trackingMessage;
    this.showLoader = false;
  }
  closeModal() {
    this.closePopup$.emit();
  }
  orderTrackingPopup(itemDetails) {
    // console.log('itemDetails', itemDetails);
    this._modalService.show({
      component: TrackOrderComponent,
      inputs: { itemDetails: itemDetails },
      outputs: {},
      mConfig: { heightFull: true },
    });
  }
  showBuyAgain_Invoice(status: string) {
    if (!status) return false;
    return this.validBuyAgainStatus.indexOf(status.toUpperCase()) > -1;
  }

  async loadReturnInfo() {
    if (!this.returnInfoInstance) {
      const { ReturnInfoComponent } = await import(
        "../../../components/return-info/return-info.component"
      );
      const factory = this.cfr.resolveComponentFactory(ReturnInfoComponent);
      this.returnInfoInstance = this.returnInfoContainerRef.createComponent(
        factory,
        null,
        this.injector
      );
      this.returnInfoInstance.instance["isBrandMsn"] = this.isBrandMsn;
      this.returnInfoInstance.instance["show"] = true;
      (
        this.returnInfoInstance.instance["removed"] as EventEmitter<boolean>
      ).subscribe((status) => {
        this.returnInfoInstance = null;
        this.returnInfoContainerRef.detach();
      });
      (
        this.returnInfoInstance.instance[
          "navigateToFAQ$"
        ] as EventEmitter<boolean>
      ).subscribe((status) => {
        this._router.navigate(["faq", { active: "CRP" }]);
      });
    } else {
      //toggle side menu
      this.returnInfoInstance.instance["show"] = true;
    }
  }

  trackAndNavigateToProductPage(url, productID, e) {
    const user = this.localStorageService.retrieve("user");
    let page = {
      linkPageName: "moglix:account dashboard-myorders",
      linkName: "buy again",
      channel: "moglix:my account",
      loginStatus: user.userId ? "registered" : "guest",
    };
    let order = {
      productID: productID,
    };

    digitalData["page"] = page;
    digitalData["custData"] = this._commonService.custDataTracking;
    digitalData["order"] = order;
    // console.log(digitalData);
    if (_satellite) {
      _satellite.track("genericClick");
    }

    e.stopPropagation();
    e.preventDefault();
    if (url) {
      this._router.navigate(["/" + url]);
    }
  }

  ngOnDestroy() {
    if (this.ifscSubscription) {
      this.ifscSubscription.unsubscribe();
    }
  }
}
