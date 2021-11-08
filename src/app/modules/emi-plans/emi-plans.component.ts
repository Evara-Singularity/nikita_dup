import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BankNamePipe } from '@app/utils/pipes/bank.pipe';
import { ObjectToArray } from '@app/utils/pipes/object-to-array.pipe';
import { EmiService } from './../emi/emi.service';

@Component({
    selector: 'emi-plans',
    templateUrl: './emi-plans.component.html',
    styleUrls: ['./emi-plans.component.scss']
})
export class EmiPlansComponent implements OnInit
{

    readonly bankMap = { 7: "AXIS", 15: "HDFC", 21: "ICICI" };
    readonly CARD_TYPES = { debitCard: 'debit_card', creditCard: 'credit_card' };
    @Input() quantity: number = 1
    @Input() productInfo: any;
    @Input() openEMIPopup: boolean = false;
    @Output() out: EventEmitter<any> = new EventEmitter<any>();
    @Output() isLoading: EventEmitter<boolean> = new EventEmitter<boolean>();
    emiPlansPrice = { quantity: 0, price: 0 };
    isTermConditionShow: boolean = false;
    emiResponse = {};
    dataEmi: Array<any> = [];
    selectedBank: any;
    selectedBankName: string = null;
    //1704
    emiRawDebitCardResponse = null;
    emiRawCreditCardResponse = null;
    paymentMethod = this.CARD_TYPES.creditCard;
    noCostEmiCount = {}

    constructor(
        private _emiService: EmiService,
        private _objectToArray: ObjectToArray,
        private _bankNamePipe: BankNamePipe
    ) { }

    ngOnInit() { this.intialLoad(); }

    intialLoad()
    {
        const price = this.getModifiedPrice();
        this.isTermConditionShow = false;
        this.isLoading.emit(true);
        this._emiService.getEmiValues({ price: price }).subscribe(
            res =>
            {
                this.isLoading.emit(false);
                if (res["status"] != true) {
                    alert("Error in placing order, see console");
                    return;
                }
                let data = res["data"];
                this.emiRawDebitCardResponse = data.emiResponse[this.CARD_TYPES.debitCard];
                this.emiRawCreditCardResponse = data.emiResponse[this.CARD_TYPES.creditCard];
                const CARD_INFO = (this.paymentMethod == this.CARD_TYPES.debitCard) ? this.emiRawDebitCardResponse : this.emiRawCreditCardResponse;
                this.processCardTypeInfo(CARD_INFO, price);
                this.selectDefaultEMI();
            }
        );
    }

    processCardTypeInfo(cardInfo, price)
    {
        const ASSOCIATIVE = "associative";
        this.emiResponse = cardInfo;
        this.dataEmi = this._objectToArray.transform(cardInfo, ASSOCIATIVE);
        this.dataEmi.forEach((outerElement) =>
        {
            const KEY = outerElement.key;
            if (this.bankMap.hasOwnProperty(KEY)) { outerElement[KEY] = this.bankMap[KEY]; }
            outerElement['bankname'] = this._bankNamePipe.transform(outerElement.key);
            let elementData = this._objectToArray.transform(outerElement.value, ASSOCIATIVE);
            elementData.forEach((innerElement) =>
            {
                if (innerElement.value['tenure'] == "03 months" || innerElement.value['tenure'] == "3") {
                    innerElement.value['emi_value'] = price / 3;
                    innerElement.value['emi_interest_paid'] = 0;
                } else if (innerElement.value['tenure'] == "06 months" || innerElement.value['tenure'] == "6") {
                    innerElement.value['emi_value'] = price / 6;
                    innerElement.value['emi_interest_paid'] = 0;
                } else {
                    innerElement.value['transactionAmount'] = innerElement.value['transactionAmount'] + innerElement.value['emi_interest_paid'];
                }
            });
        });
        let checkNumberRegex = /^\d+$/;
        let dataEmiIndex = this.dataEmi.length;
        while (dataEmiIndex--) {
            let isnum = checkNumberRegex.test(this.dataEmi[dataEmiIndex]["key"]);
            if (isnum) {
                this.dataEmi.splice(dataEmiIndex, 1);
            }
        }
        this.updateEMITypesCount()
        this.dataEmi.sort((a, b) =>
        {
            let nameA = a.key.toUpperCase();
            let nameB = b.key.toUpperCase();
            if (nameA < nameB) { return -1; }
            if (nameA > nameB) { return 1; }
            nameA = a.key.toUpperCase();
            nameB = b.key.toUpperCase();
            if (nameA < nameB) { return -1; }
            if (nameA > nameB) { return 1; }
            return 0;
        });
        this.selectedBank = this.dataEmi[0]["key"];
        this.parseResponse();
    }

    updateEMITypesCount()
    {
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
    }

    selectDefaultEMI()
    {
        if (this.dataEmi && this.dataEmi.length > 0) {
            const data = this.dataEmi[0];
            //const emiArr: [] = this._objectToArray.transform(this.dataEmi[0]['value'], "associative");
            this.selectedBank = data.key;
            this.selectedBankName = data.bankname;
            // const noCostEMI = emiArr.filter(item => item['value']['emi_interest_paid'] === 0)
            // const withCostEMI = emiArr.filter(item => item['value']['emi_interest_paid'] !== 0)
            // if (noCostEMI.length > 0) {
            //     this.selectedEMIKey = noCostEMI[0]['key'];
            //     this.selectEmI(this.getEmiMonths(data.key), noCostEMI[0]['value']['emiBankInterest'], noCostEMI[0]['value']['transactionAmount'])
            // } else {
            //     this.selectedEMIKey = withCostEMI[0]['key'];
            //     this.selectEmI(this.getEmiMonths(data.key), withCostEMI[0]['value']['emiBankInterest'], withCostEMI[0]['value']['transactionAmount'])
            // }
        }
    }

    changeCardType(card)
    {
        this.selectedBank = null;
        this.selectedBankName = null;
        const CARD_INFO = (card == this.CARD_TYPES.debitCard) ? this.emiRawDebitCardResponse : this.emiRawCreditCardResponse;
        this.paymentMethod = card;
        this.processCardTypeInfo(CARD_INFO, this.emiPlansPrice.price)
        this.selectDefaultEMI();
    }

    selectedBankChange(data)
    {
        if (data) {
            this.selectedBank = data.key;
            this.selectedBankName = data.bankname;
        }
    }

    getModifiedPrice()
    {
        let quantity = this.quantity;
        let price = 0;
        if (!isNaN(quantity) && quantity > 0) {
            price = Number(quantity) * Number(this.productInfo['priceWithoutTax']);
            this.emiPlansPrice.price = price;
            this.emiPlansPrice.quantity = quantity;
        } else {
            price = this.productInfo['priceWithoutTax'];
            this.emiPlansPrice.price = price;
            this.emiPlansPrice.quantity = this.productInfo['minimal_quantity'];
        }
        return price;
    }

    parseResponse()
    {
        let obj = {};
        (this.dataEmi as any[]).forEach(emi => { obj[emi.key] = emi.value })
        this.emiResponse = obj;
    }

    showTermCondtion() { this.isTermConditionShow = !this.isTermConditionShow; }

    outData(data) { this.out.emit(data); }

    getEmiMonths(emiKey)
    {
        if (isNaN(parseInt(emiKey.replace(/^\D+/g, ''), 10))) { return 3; }
        return parseInt(emiKey.replace(/^\D+/g, ''), 10);
    }

    changeBank($event) { this.selectedBank = $event.target.value; }

    closeEMIPalns(data)
    {
        this.out.emit(data);
        this.openEMIPopup = false;
    }
}
