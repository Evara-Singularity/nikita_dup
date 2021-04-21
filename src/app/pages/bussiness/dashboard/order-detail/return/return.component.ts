import { ViewEncapsulation, Output, EventEmitter, Input } from "@angular/core";
import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import CONSTANTS from "src/app/config/constants";
import { ReturnService } from "./return.service";

@Component({
  selector: "app-return",
  templateUrl: "./return.html",
  styleUrls: ["./return.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ReturnComponent {
  @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
  returnForm: FormGroup;
  step: number;
  itemImages: Array<any>;
  chequeImage: any;
  cancelReasons: Array<{}>;
  @Input() data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;

  constructor(
    private _returnService: ReturnService,
    private _formBuilder: FormBuilder
  ) {
    this.itemImages = [];
    this.step = 1;
    this.returnForm = this._formBuilder.group({
      requestType: [null, [Validators.required]],
      productImage: [null, [Validators.required]],
      reasonId: [null, [Validators.required]],
      quantity: [null, [Validators.required]],
      comment: [],
      bankDetail: this._formBuilder.group({
        bankName: [null, [Validators.required]],
        ifscCode: [null, [Validators.required]],
        acountName: [null, [Validators.required]],
        acountNo: [null, [Validators.required]],
        chequeUrl: [null],
      }),
    });

    this._returnService.getCancelReasons().subscribe((cancelReasons) => {
      if (
        cancelReasons != undefined &&
        cancelReasons != null &&
        Array.isArray(cancelReasons)
      ) {
        this.cancelReasons = cancelReasons;
      }
    });
  }

  ngOnInit() {}

  cancelOrder() {
    this.closePopup$.emit();
  }

  returnProduct(rData, valid) {
    rData.itemId = this.data.order_id;
    rData.msn = this.data.product_msn;
    this._returnService.returnItem(rData).subscribe(() => {});
  }

  addItemImage(event) {
    this.itemImages.push(event.target.files[0]);
  }

  addChequeImage(event) {
    this.chequeImage = event.target.files[0];
  }

  removeItemImage(i) {
    this.itemImages.splice(i, 1);
  }

  removeChequeImage() {
    this.chequeImage = null;
  }
}
