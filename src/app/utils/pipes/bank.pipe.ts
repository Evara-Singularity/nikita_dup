import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'bankpipe'
})
export class BankNamePipe implements PipeTransform
{
    transform(value: any, ...args: any[]): any
    {
        if (value == "SCB") {
            return "Standard Chartered Bank";
        }
        else if (value == "YES") {
            return "YES Bank";
        }
        else if (value == "ICICI") {
            return "ICICI Bank";
        }
        else if (value == "KOTAK") {
            return "Kotak Mahindra Bank";
        }
        else if (value == "HSBC") {
            return "HSBC Bank";
        }
        else if (value == "RBL") {
            return "RBL Bank";
        }
        else if (value == "INDUS") {
            return "IndusInd Bank";
        }
        else if (value == "AXIS") {
            return "Axis Bank";
        }
        else if (value == "HDFC") {
            return "HDFC Bank";
        }
        else if (value == "AMEX") {
            return "American Express Bank";
        }
        else if (value == "ICIC") {
            return "ICICI Bank";
        }
        else if (value == "INDB") {
            return "Induslnd Bank";
        }
        else if (value == "KKBK") {
            return "Kotak Mahindra Bank";
        }
        else if (value == "RATN") {
            return "RBL Bank";
        }
        else if (value == "SCBL") {
            return "Standard Chartered Bank";
        }
        else if (value == "UTIB") {
            return "Axis Bank";
        }
        else if (value == "ONEC") {
            return "ONECARD";
        }
        else if (value == "YESB") {
            return "Yes Bank";
        }
        else if (value == "SBI") {
            return "State Bank of India";
        }
        else if (value == "BAJFIN") {
            return "Bajaj Finserv No Cost EMI Card";
        }
        else if (value == "AXISD") {
            return "Axis Bank Debit Card";
        }
        else if (value == "ICICID") {
            return "ICICI Bank Debit Card";
        }
        else if (value == "HDFCD") {
            return "HDFC Bank Debit Card";
        }
        else if (value == "BOBD") {
            return "Bank of Baroda Debit Card";
        }
        else if (value == "FEDED") {
            return "Federal Bank Debit Card";
        }
        else if (value == "KOTAKD") {
            return "Kotak Bank Debit Card";
        }
        else if (value == "HDFC_DC") {
            return "HDFC Bank Debit Card";
        }
        else if (value == "SBIN") {
            return "State Bank of India";
        }
        else if (value == "CITI") {
            return "Citi Bank";
        }
        else {
            return value;
        }
    }
}

import { NgModule } from '@angular/core';
@NgModule({
    imports: [],
    exports: [BankNamePipe],
    declarations: [BankNamePipe],
    providers: [BankNamePipe],
})
export class BankNamePipeModule { }


