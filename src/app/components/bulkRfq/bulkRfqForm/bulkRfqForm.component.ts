import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import CONSTANTS from "@app/config/constants";
import { ENDPOINTS } from "@app/config/endpoints";
import { SharedAuthService } from "@app/modules/shared-auth-v1/shared-auth.service";
import { ToastMessageService } from "@app/modules/toastMessage/toast-message.service";
import { LocalAuthService } from "@app/utils/services/auth.service";
import { DataService } from "@app/utils/services/data.service";
import { GlobalLoaderService } from "@app/utils/services/global-loader.service";
import { LocalStorageService } from "ngx-webstorage";

@Component({
  selector: "bulkRfqForm",
  templateUrl: "./bulkRfqForm.component.html",
  styleUrls: ["./bulkRfqForm.component.scss"],
})
export class BulkRfqFormComponent implements OnInit {
  @Output() moveToNext$: EventEmitter<any> = new EventEmitter<any>();
  @Input("loginAndValidatePhone") LoginAndValidatePhone: String;
  @Output() bulkRfqFormPhoneno$: EventEmitter<any> = new EventEmitter<any>();
  @Output() setBulkRfqForm$: EventEmitter<FormGroup> =
    new EventEmitter<FormGroup>();

  readonly PRICE_VALUES = ["1", "5", "10", "15", "20"];
  PRODUCT_TYPES = [];
  readonly stepNameOtp = "OTP";
  readonly stepNameRfqForm = "RFQ_FORM";
  readonly API = CONSTANTS.NEW_MOGLIX_API;

  bulkrfqForm: FormGroup;

  constructor(
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private _localAuthService: LocalAuthService,
    private _loader: GlobalLoaderService,
    private _sharedAuthService: SharedAuthService,
    private _tms: ToastMessageService,
    private _dataService: DataService
  ) {
    this.createRfqForm();
  }

  ngOnInit(): void {
    if (this.LoginAndValidatePhone) {
      this.loginAndValidatePhone();
    }
    this.fetchCategoryList("tools");
  }

  createRfqForm() {
    const user = this.localStorageService.retrieve("user");
    this.bulkrfqForm = this.formBuilder.group({
      productType: ["", [Validators.required]],
      quantity: ["", [Validators.required, Validators.max(1000)]],
      budget: ["", Validators.maxLength(8)],
      phone: [
        user != null && user.authenticated == "true" ? user.phone : "",
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
    });
  }

  get isMaxQuantity(){ return this.bulkrfqForm.get('quantity') }
  
  loginAndValidatePhone() {
    const user = this._localAuthService.getUserSession();
    this.setBulkRfqForm$.emit(this.bulkrfqForm.value);
    user && user["authenticated"] == "true"
      ? this.moveToNext(this.stepNameRfqForm, true)
      : this.validateUserWithPhone();
  }

  validateUserWithPhone() {
    this._loader.setLoaderState(true);
    const body = {
      email: "",
      phone: this.bulkrfqForm.get("phone").value,
      type: "p",
    };
    this._sharedAuthService.isUserExist(body).subscribe((response) => {
      if (response["statusCode"] == 200) {
        const isUserExists = response["exists"] as boolean;
        const FLOW_TYPE = this._sharedAuthService.AUTH_USING_PHONE;
        this._localAuthService.setAuthFlow(
          isUserExists,
          FLOW_TYPE,
          this._sharedAuthService.AUTH_USING_PHONE,
          this.bulkrfqForm.get("phone").value
        );
        this.moveToNext(this.stepNameOtp, isUserExists);
      } else {
        this._tms.show({ type: "error", text: response["message"] });
      }
      this._loader.setLoaderState(false);
    });
  }

  moveToNext(stepName, isUserExists) {
    const data = {
      phone: this.bulkrfqForm.get("phone").value,
      isUserExists: isUserExists,
    };
    this.bulkRfqFormPhoneno$.emit(data);
    this.moveToNext$.emit(stepName);
  }

  onkeyUp(value: string) {
    this.PRODUCT_TYPES = [];
    if (value.length > 2) {
      setTimeout(() => {
        this.fetchCategoryList(value);
      }, 600);
    }

    console.log("PRODUCT_TYPES ======>" , this.PRODUCT_TYPES);
  }

  private fetchCategoryList(value: string) {
    const url = this.API + ENDPOINTS.SEARCH_CATEGORY_LIST + value + "&countryCode=356";
    this._dataService.callRestful("GET", url).subscribe(
      (response) => {
        this._loader.setLoaderState(false);
        if (response && response["totalCount"] > 0) {
          const categoryData = response["categorylist"];
          this.PRODUCT_TYPES = categoryData.map((res) =>
            (res.categoryName as string).trim()
          );
        } else {
          this.bulkrfqForm.get("productType").setErrors({ invalid: true });
          this._tms.show({ type: "error", text: "Related data not found" });
        }
      },
      (error) => {
        this.bulkrfqForm.get("productType").setErrors({ invalid: true });
        this._tms.show({ type: "error", text: "Something Went Wrong" });
      }
    );
  }

  updateProductType(arg0: AbstractControl) {}

  updateQuantity(arg0: FormGroup) {}

}
