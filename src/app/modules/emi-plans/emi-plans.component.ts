import { EmiService } from './../emi/emi.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ObjectToArray } from '@app/utils/pipes/object-to-array.pipe';
import { ProductService } from '@app/utils/services/product.service';
import { CartService } from '@app/utils/services/cart.service';
import { BankNamePipe } from '@app/utils/pipes/bank.pipe';

@Component({
    selector: 'emi-plans',
    templateUrl: './emi-plans.component.html',
    styleUrls: ['./emi-plans.component.scss']
})
export class EmiPlansComponent implements OnInit
{

    @Input() quantity: number = 1
    @Input() productInfo: any;
    @Input() openEMIPopup: boolean = false;
    @Output() out: EventEmitter<any> = new EventEmitter<any>();
    @Output() isLoading: EventEmitter<boolean> = new EventEmitter<boolean>();
    emiPlansPrice = { quantity: 0, price: 0 };
    isTermConditionShow: boolean = false;
    emiResponse = {};
    dataEmi: Array<any> = [];
    bankMap = { 7: "AXIS", 15: "HDFC", 21: "ICICI" };
    selectedBank: any;
    emiForm: FormGroup;
    selectedBankName: string = null;
    //1704
    emiRawDebitCardResponse = null;
    emiRawCreditCardResponse = null;
    readonly CARD_TYPES = { debitCard: 'debit_card', creditCard: 'credit_card' };
    paymentMethod = this.CARD_TYPES.creditCard;
    selectedEMIKey = null;
    selectedBankCode: string;
    noCostEmiCount = {};

    constructor(
        private productService: ProductService,
        public objectToArray: ObjectToArray,
        private formBuilder: FormBuilder,
        private _emiService: EmiService,
        private _cartService: CartService,
        private _objectToArray: ObjectToArray,
        private _bankNamePipe: BankNamePipe
    ) { }

    ngOnInit()
    {
        let cartSession = this._cartService.getCartSession();
        cartSession['nocostEmi'] = 0;
        let cart = cartSession["cart"];
        let apiData = { price: this.productInfo['priceWithoutTax'], gateWay: "payu" };
        this._emiService.getEmiValues(apiData).subscribe((res): void =>
        {
            if (res["status"] != true) {
                alert("Error in placing order, see console");
                return;
            }
            let data = res["data"];
            this.emiRawDebitCardResponse = data.emiResponse[this.CARD_TYPES.debitCard];
            this.emiRawCreditCardResponse = data.emiResponse[this.CARD_TYPES.creditCard];
            this.processRawResponse(
                (this.paymentMethod == this.CARD_TYPES.debitCard) ? this.emiRawDebitCardResponse : this.emiRawCreditCardResponse, cart);
            this.selectDefaultEMI();
        });

        //TODO:check the condition with Pritam
        // if (this._checkoutService.getInvoiceType() == "retail") {
        //     apiData["gateWay"] = "payu";
        // } else {
        //     apiData["gateWay"] = "razorpay";
        // }
        this.selectedBankName = "AXIS";
        this.createForm();
        this.intialLoad();
    }

    selectDefaultEMI()
    {
        if (this.dataEmi && this.dataEmi.length > 0) {
            const data = this.dataEmi[0];
            const emiArr: [] = this._objectToArray.transform(this.dataEmi[0]['value'], "associative");
            this.selectedBank = data.key;
            this.selectedBankName = data.bankname;
            const noCostEMI = emiArr.filter(item => item['value']['emi_interest_paid'] === 0)
            const withCostEMI = emiArr.filter(item => item['value']['emi_interest_paid'] !== 0)
            if (noCostEMI.length > 0) {
                this.selectedEMIKey = noCostEMI[0]['key'];
                this.selectEmI(this.getEmiMonths(data.key), noCostEMI[0]['value']['emiBankInterest'], noCostEMI[0]['value']['transactionAmount'])
            } else {
                this.selectedEMIKey = withCostEMI[0]['key'];
                this.selectEmI(this.getEmiMonths(data.key), withCostEMI[0]['value']['emiBankInterest'], withCostEMI[0]['value']['transactionAmount'])
            }
            this.emiForm.get('requestParams.bankcode').setValue(this.selectedEMIKey);
        }
    }

    private processRawResponse(data: any, cart: any)
    {
        const cardTypeResponse = data;
        this.emiResponse = cardTypeResponse;
        this.dataEmi = this._objectToArray.transform(cardTypeResponse, "associative");
        // // console.log('this.dataEmi ==>', this.dataEmi);
        this.dataEmi.forEach((element, index) =>
        {
            if (this.bankMap.hasOwnProperty(element.key)) {
                element.key = this.bankMap[element.key];
            }
            element['bankname'] = this._bankNamePipe.transform(element.key);
            let elementData = this._objectToArray.transform(element.value, "associative");
            elementData.forEach((ele, index) =>
            {
                if (ele.value['tenure'] == "03 months" || ele.value['tenure'] == "3") {
                    ele.value['emi_value'] = (cart.totalPayableAmount) / 3;
                    ele.value['emi_interest_paid'] = 0;
                } else if (ele.value['tenure'] == "06 months" || ele.value['tenure'] == "6") {
                    ele.value['emi_value'] = (cart.totalPayableAmount) / 6;
                    ele.value['emi_interest_paid'] = 0;
                } else {
                    ele.value['transactionAmount'] = ele.value['transactionAmount'] + ele.value['emi_interest_paid'];
                }
            });
        });

        const noCostEmiCount = {};
        for (const key in this.emiResponse) {
            if (Object.prototype.hasOwnProperty.call(this.emiResponse, key)) {
                const emiObjs = this.emiResponse[key];
                let noCost = 0;
                let withCost = 0;
                for (const emiKey in emiObjs) {
                    if (Object.prototype.hasOwnProperty.call(emiObjs, emiKey)) {
                        const element = emiObjs[emiKey];
                        if (element.emi_interest_paid === 0) {
                            noCost = noCost + 1
                        } else {
                            withCost = withCost + 1
                        }
                    }
                }
                if (this.bankMap.hasOwnProperty(key)) {
                    noCostEmiCount[this.bankMap[key]] = { noCost, withCost }
                } else {
                    noCostEmiCount[key] = { noCost, withCost }
                }
            }
        }
        this.noCostEmiCount = noCostEmiCount;

        let checkNumberRegex = /^\d+$/;

        let dataEmiIndex = this.dataEmi.length;
        while (dataEmiIndex--) {
            let isnum = checkNumberRegex.test(this.dataEmi[dataEmiIndex]["key"]);
            if (isnum)
                this.dataEmi.splice(dataEmiIndex, 1);
        }

        this.dataEmi.sort((a, b) =>
        {
            let nameA = a.key.toUpperCase(); // ignore upper and lowercase
            let nameB = b.key.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            nameA = a.key.toUpperCase(); // ignore upper and lowercase
            nameB = b.key.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });

        this.selectedBankCode = this.dataEmi[0]["key"];
        this.selectedBank = "0";
        this.parseResponse();
    }


    selectEmI(month, rate, amount, emiObj?)
    {
        if (emiObj) {
            this.selectedEMIKey = emiObj['key']
        }
        // this.getEmiDiscount(
        //     month,
        //     (rate) ? (parseInt(rate) / 1200) : null,
        //     amount
        // );
        // this.step = 2;
        // this.scollToSection("emiCardSection");
    }

    createForm()
    {
        this.emiForm = this.formBuilder.group({
            "requestParams": this.formBuilder.group({
                "bankname": [this.selectedBankName, [Validators.required]]
            })
        });
    }

    intialLoad()
    {
        let quantity = this.quantity
        let price: number = 0;

        if (!isNaN(quantity) && quantity > 0) {
            price = Number(quantity) * Number(this.productInfo['priceWithoutTax']);
            this.emiPlansPrice.price = price;
            this.emiPlansPrice.quantity = quantity;
        } else {
            price = this.productInfo['priceWithoutTax'];
            this.emiPlansPrice.price = price;
            this.emiPlansPrice.quantity = this.productInfo['minimal_quantity'];
        }

        this.isTermConditionShow = false;
        this.isLoading.emit(true);
        this.productService.getEmiPlans(price).subscribe(
            res =>
            {
                this.isLoading.emit(false);
                this.emiResponse = res['data']['emiResponse'];
                this.dataEmi = this.objectToArray.transform(this.emiResponse, "associative");
                this.dataEmi.forEach((element, index) =>
                {
                    if (this.bankMap.hasOwnProperty(element.key)) {
                        element.key = this.bankMap[element.key];
                    }
                    let elementData = this.objectToArray.transform(element.value, "associative");
                    elementData.forEach((ele, index) =>
                    {
                        if (ele.value['tenure'] == "03 months") {
                            ele.value['emi_value'] = price / 3;
                            ele.value['emi_interest_paid'] = "No Cost EMI";
                        } else if (ele.value['tenure'] == "06 months") {
                            ele.value['emi_value'] = price / 6;
                            ele.value['emi_interest_paid'] = "No Cost EMI";
                        } else {
                            ele.value['transactionAmount'] = ele.value['transactionAmount'] + ele.value['emi_interest_paid'];
                        }
                    });
                });

                let checkNumberRegex = /^\d+$/;

                let dataEmiIndex = this.dataEmi.length;
                while (dataEmiIndex--) {
                    let isnum = checkNumberRegex.test(this.dataEmi[dataEmiIndex]["key"]);
                    if (isnum)
                        this.dataEmi.splice(dataEmiIndex, 1);
                }
                this.dataEmi.sort((a, b) =>
                {
                    let nameA = a.key.toUpperCase(); // ignore upper and lowercase
                    let nameB = b.key.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    nameA = a.key.toUpperCase(); // ignore upper and lowercase
                    nameB = b.key.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    return 0;
                })
                this.selectedBank = this.dataEmi[0]["key"];
                this.openEMIPopup = !this.openEMIPopup;
                this.parseResponse();
            }
        );
    }

    parseResponse()
    {
        let obj = {};
        for (let i = 0; i < this.dataEmi.length; i++) {
            obj[this.dataEmi[i].key] = this.dataEmi[i].value;
        }
        this.emiResponse = obj;
    }

    showTermCondtion()
    {
        this.isTermConditionShow = !this.isTermConditionShow;
    }

    outData(data)
    {
        this.out.emit(data);
    }

    getEmiMonths(emiKey)
    {
        if (isNaN(parseInt(emiKey.replace(/^\D+/g, ''), 10))) {
            return 3;
        }
        return parseInt(emiKey.replace(/^\D+/g, ''), 10);
    }

    changeBank($event)
    {
        this.selectedBank = $event.target.value;
    }

    closeEMIPalns(data)
    {
        this.out.emit(data);
        this.openEMIPopup = false;
    }
}
