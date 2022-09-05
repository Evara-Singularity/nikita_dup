export interface Address
{
    idAddress: number;
    addressType: AddressType;
    gstin: null;
    country: Country;
    state: State;
    idCustomer: number;
    addressCustomerName: string;
    addressLine: string;
    city: string;
    postCode: string;
    landmark: null;
    alias: null;
    email: string;
    phone: string;
    alternatePhone: null;
    dateAdd: number;
    dateUpd: number;
    active: boolean;
    isGstInvoice: boolean;
    invoiceType: string;
    phoneVerified: boolean;
    address_tag: null;
    coordintes: null;
    gstinVerified: null;
}
export interface AddressType
{
    idAddressType: number;
    addressType: string;
    comment: string;
    active: boolean;
}
export interface Country
{
    idCountry: number;
    name: string;
    currency: Currency;
    isoCode: string;
    callPrefix: number;
    active: boolean;
}
export interface Currency
{
    idCurrency: number;
    name: string;
    isoCode: string;
    isoCodeNum: string;
    sign: string;
    decimals: number;
    active: boolean;
}
export interface State
{
    idState: number;
    idCountry: number;
    name: string;
    isoCode: string;
    active: boolean;
}

export interface NonServiceableAndCod
{
    nonServiceables: string[],
    nonCods: string[]
}
export interface CodDetails extends NonServiceableAndCod
{
    iswithInCODLimit: boolean,
    message: string
}