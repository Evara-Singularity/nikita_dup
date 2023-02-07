import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { SharedAuthService } from "@app/modules/shared-auth-v1/shared-auth.service";
import { ToastMessageService } from "@app/modules/toastMessage/toast-message.service";
import { LocalAuthService } from "@app/utils/services/auth.service";
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

  readonly PRICE_VALUES = [
    "1 qty",
    "2 - 5 qty",
    "6 - 10 qty",
    "11 - 15 qty",
    "16 - 1100 qty",
  ];
  readonly PRODUCT_TYPES = [
    "PRODUCT 1",
    "PRODUCT 2",
    "PRODUCT 3",
    "PRODUCT 4",
    "PRODUCT 5",
  ];
  readonly stepNameOtp = "OTP";
  readonly stepNameRfqForm = "RFQ_FORM";

  bulkrfqForm: FormGroup;

  constructor(
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private _localAuthService: LocalAuthService,
    private _loader: GlobalLoaderService,
    private _sharedAuthService: SharedAuthService,
    private _tms: ToastMessageService
  ) {
    this.createRfqForm();
  }

  ngOnInit(): void {
    if (this.LoginAndValidatePhone) {
      this.loginAndValidatePhone();
    }
  }

  createRfqForm() {
    const user = this.localStorageService.retrieve("user");
    this.bulkrfqForm = this.formBuilder.group({
      productType: ["", [Validators.required]],
      quantity: ["", [Validators.required]],
      budget: [""],
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

  loginAndValidatePhone() {
    const user = this._localAuthService.getUserSession();
    this.setBulkRfqForm$.emit(this.bulkrfqForm.value);
    user && user["authenticated"] == "true"
      ? this.moveToNext(this.stepNameRfqForm)
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
        if (isUserExists) {
          const data = {
            phone: this.bulkrfqForm.get("phone").value,
            isUserExists: isUserExists,
          };
          this.bulkRfqFormPhoneno$.emit(data);
          this.moveToNext(this.stepNameOtp);
        } else {
          const data = {
            phone: this.bulkrfqForm.get("phone").value,
            isUserExists: isUserExists,
          };
          this.bulkRfqFormPhoneno$.emit(data);
          this.moveToNext(this.stepNameOtp);
        }
      } else {
        this._tms.show({ type: "error", text: response["message"] });
      }
      this._loader.setLoaderState(false);
    });
  }

  moveToNext(stepName) {
    this.moveToNext$.emit(stepName);
  }

  updateProductType(arg0: AbstractControl) {}
  updateQuantity(arg0: AbstractControl) {}
}
