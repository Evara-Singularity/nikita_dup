export class CheckoutUtil
{
    static formatAggregateValues(aggregates)
    {
        const AGGREGATES = Object.values(aggregates).map((item) => item['aggregate']);
        return AGGREGATES;
    }

    static getNonServiceableMsns(items: any[]): any[]
    {
        const NON_SERVICEABLES = items.filter((item) => !(item['serviceable'])).map((item) => item['productId']);
        return NON_SERVICEABLES;
    }

    static getNonCashOnDeliveryMsns(items: any[])
    {
        const NON_CASH_ON_DELIVERABLES = items.filter((item) => !(item['codAvailable'])).map((item) => item['productId']);
        return NON_CASH_ON_DELIVERABLES;
    }

    static filterCartItemsByMSNs(cartItems: any[], msns: any[])
    {
        const FILTERED_MSNS = cartItems.filter((item) =>
        {
            const MSN: string = (<string>item['productId']).toUpperCase();
            return msns.includes(MSN)
        })
        return FILTERED_MSNS;
    }

    static formatNonServiceableFromCartItems(nonServiceableItems: any[])
    {
        const ITEMS = [];
        nonServiceableItems.forEach((item, index) =>
        {
            const ITEM = { type: "unserviceable", count: index + 1, msnid: item['productId'], data: null };
            ITEM['data'] = { productName: item['productName'], text1: "in your cart is unserviceable" };
            ITEMS.push(ITEM);
        });
        return ITEMS;
    }
}