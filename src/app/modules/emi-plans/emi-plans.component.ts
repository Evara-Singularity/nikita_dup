import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ObjectToArray } from '@app/utils/pipes/object-to-array.pipe';
import { ProductService } from '@app/utils/services/product.service';

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

    constructor(
        private productService: ProductService,
        public objectToArray: ObjectToArray,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit()
    {
        this.selectedBankName = "AXIS";
        this.createForm();
        this.intialLoad();
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
