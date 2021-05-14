import { FormControl } from "@angular/forms";

export class Bank {
  static ifscValidate(c: FormControl) {
    let ifscregex = "^[A-Za-z]{4}[0][a-zA-Z0-9]{6}$";
    let error = null;

    if (c.value === null) {
      error = { required: true };
      return error;
    }
    let ifsc = c.value;

    if (ifsc.match(ifscregex) != null) {
      error = null;
    } else {
      error = { invalidIfsc: true };
    }
    return error;
  }

  static bankNameorAccountHolder(c: FormControl) {
    let bank = "^[a-zA-Z ]{2,30}$";
    let error = null;

    if (c.value === null) {
      error = { required: true };
      return error;
    }

    let bankCheck = c.value;

    if (bankCheck.match(bank) != null) {
      error = null;
    } else {
      error = { invalidBankName: true };
    }
    return error;
  }

  static bankAccount(c: FormControl) {
    let error = null;
    let bankC = "^[0-9]{9,18}$";

    if (c.value === null) {
      error = { required: true };
      return error;
    }
    let banknum = c.value;

    if (banknum.match(bankC) != null) {
      error = null;
    } else {
      error = { invalidAccount: true };
    }
    return error;
  }
}
