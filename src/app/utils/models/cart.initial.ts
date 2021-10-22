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
    isOutOfStock?: boolean,
    brandId?: string,
}
