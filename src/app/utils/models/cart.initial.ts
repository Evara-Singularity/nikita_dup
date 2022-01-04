export const cartSession = {
    "noOfItems": 0,
    "cart": {},
    "itemsList": [],
}

export interface AddToCartProductSchema {
    cartId: number;
    productId: string;
    productName: string;
    productImg: string;
    productUrl: string;
    createdAt: any;
    updatedAt: any;
    amount: number;
    offer: null;
    amountWithOffer: null;
    taxes: number;
    amountWithTaxes: null;
    totalPayableAmount: number;
    isPersistant: boolean;
    productQuantity: number;
    bulkPriceMap: any;
    taxPercentage: number;
    priceWithoutTax: number;
    bulkPriceWithoutTax: null;
    brandName: string;
    categoryCode: string;
    taxonomyCode: string;
    buyNow: boolean;
    productUnitPrice: number;
    bulkPrice: null;
    expireAt: null;
    filterAttributesList?: any;
    isOutOfStock?: boolean;
    quantityAvailable?: number,
    productMRP?: number;
    tpawot?: number;
    brandId?: string,
    isFBT?: boolean;
    productSmallImage:string;
    productImage:string
}

export interface CartMasterSchema {
    cart: CartObjectSchema;
    itemsList: AddToCartProductSchema[];
    addressList: CartAddressObjectSchema[];
    payment?: any;
    extraOffer?: any;
    offersList: any[];
    noOfItems?: number;
}

export interface CartAddressObjectSchema {
    id: number;
    cartId: number;
    addressId: number;
    type: string;
    createdAt: number;
    updatedAt: number;
    invoiceType?: any;
}

export interface CartObjectSchema {
    cartId: number;
    sessionId: string;
    userId: number;
    agentId?: any;
    isPersistant: boolean;
    createdAt: number;
    updatedAt: number;
    closedAt?: any;
    orderId?: any;
    totalAmount: number;
    totalOffer: number;
    totalAmountWithOffer: number;
    taxes: number;
    totalAmountWithTaxes?: any;
    shippingCharges: number;
    currency: string;
    isGift: boolean;
    giftMessage?: any;
    giftPackingCharges: number;
    totalPayableAmount: number;
    noCostEmiDiscount?: any;
    buyNow?: any;
    tawot: number;
    tpt: number;
}
