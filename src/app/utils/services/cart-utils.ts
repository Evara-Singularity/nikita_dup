import { ValidateDto } from "../models/cart.initial";

export class CartUtils
{
    //dont ever write constructor in this to inject
    static generateGenericCartSession(cartSessionFromAPI)
    {
        const modifiedCartSessionObject = {
            cart: Object.assign({}, cartSessionFromAPI['cart']),
            itemsList: (cartSessionFromAPI["itemsList"] ? [...cartSessionFromAPI["itemsList"]] : []),
            addressList: (cartSessionFromAPI["addressList"] ? [...cartSessionFromAPI["addressList"]] : []),
            payment: cartSessionFromAPI["payment"],
            offersList: cartSessionFromAPI["offersList"],
            extraOffer: cartSessionFromAPI["extraOffer"]
        }
        let totalAmount: number = 0;
        let tawot: number = 0; // totalAmountWithOutTax
        let tpt: number = 0; //totalPayableTax
        let itemsList = modifiedCartSessionObject.itemsList ? modifiedCartSessionObject.itemsList : [];
        for (let item of itemsList) {
            if (item["bulkPrice"] == null) {
                item["totalPayableAmount"] = CartUtils.getTwoDecimalValue(item["productUnitPrice"] * item["productQuantity"]);
                item['tpawot'] = CartUtils.getTwoDecimalValue(item['priceWithoutTax'] * item['productQuantity']);
                item['tax'] = CartUtils.getTwoDecimalValue(item["totalPayableAmount"] - item["tpawot"]);
            }
            else {
                item["totalPayableAmount"] = (item["bulkPrice"]) ? CartUtils.getTwoDecimalValue(item["bulkPrice"] * item["productQuantity"]) : 0;
                item['tpawot'] = (item['bulkPriceWithoutTax']) ? CartUtils.getTwoDecimalValue(item['bulkPriceWithoutTax'] * item['productQuantity']) : 0;
                item['tax'] = CartUtils.getTwoDecimalValue(item["totalPayableAmount"] - item["tpawot"]);
            }
            totalAmount = CartUtils.getTwoDecimalValue(totalAmount + item.totalPayableAmount);
            tawot = CartUtils.getTwoDecimalValue(tawot + item.tpawot);
            tpt = tpt + item['tax'];
        };
        modifiedCartSessionObject.cart.totalAmount = totalAmount;
        modifiedCartSessionObject.cart.totalPayableAmount = (totalAmount + modifiedCartSessionObject.cart['shippingCharges']) - (modifiedCartSessionObject.cart['totalOffer'] || 0);
        modifiedCartSessionObject.cart.tawot = tawot;
        modifiedCartSessionObject.cart.tpt = tpt;
        modifiedCartSessionObject.itemsList = itemsList;
        return modifiedCartSessionObject;
    }

    static getShippingObj(cartSessions)
    {
        let sro = { itemsList: [], totalPayableAmount: 0 };
        if (cartSessions && cartSessions['itemsList'] && cartSessions['itemsList'].length > 0) {
            let itemsList: Array<{}> = cartSessions['itemsList'];
            itemsList.map((item) =>
            {
                sro.itemsList.push({ "productId": item["productId"], "categoryId": item["categoryCode"], "taxonomy": item["taxonomyCode"] });
            });
        }
        if (cartSessions && cartSessions['cart']) {
            sro['totalPayableAmount'] = cartSessions['cart']['totalPayableAmount'];
        }
        return sro;
    }

    static getValidateDto(validateDto: ValidateDto)
    {
        const cartSession = validateDto.cartSession;
        const shippingAddress = validateDto.shippingAddress;
        const billingAddress = validateDto.billingAddress;
        const invoiceType = validateDto.invoiceType;
        const isBuyNow = validateDto.isBuyNow;
        let cart = cartSession.cart;
        let returnValue = {
            "shoppingCartDto": {
                "cart":
                {
                    "cartId": cart["cartId"],
                    "sessionId": cart["sessionId"],
                    "userId": cart["userId"],
                    "agentId": cart["agentId"] ? cart["agentId"] : null,
                    "isPersistant": true,
                    "createdAt": null,
                    "updatedAt": null,
                    "closedAt": null,
                    "orderId": null,
                    "totalAmount": cart["totalAmount"] == null ? 0 : cart["totalAmount"],
                    "totalOffer": cart["totalOffer"] == null ? 0 : cart["totalOffer"],
                    "totalAmountWithOffer": cart["totalAmountWithOffer"] == null ? 0 : cart["totalAmountWithOffer"],
                    "taxes": cart["taxes"] == null ? 0 : cart["taxes"],
                    "totalAmountWithTaxes": cart["totalAmountWithTax"],
                    "shippingCharges": cart["shippingCharges"] == null ? 0 : cart["shippingCharges"],
                    "currency": cart["currency"] == null ? "INR" : cart["currency"],
                    "isGift": cart["gift"] == null ? false : cart["gift"],
                    "giftMessage": cart["giftMessage"],
                    "giftPackingCharges": cart["giftPackingCharges"] == null ? 0 : cart["giftPackingCharges"],
                    "totalPayableAmount": cart["totalAmount"] == null ? 0 : cart["totalAmount"]
                },
                "itemsList": cartSession.itemsList,
                "addressList": [
                    {
                        "addressId": shippingAddress.idAddress,
                        "type": "shipping",
                        "invoiceType": invoiceType
                    }
                ],
                "payment": null,
                "deliveryMethod": { "deliveryMethodId": 77, "type": "kjhlh" },
                "offersList": (cartSession.offersList != undefined && cartSession.offersList.length > 0) ? cartSession.offersList : null
            }
        };
        if (isBuyNow) { returnValue['shoppingCartDto']['cart']['buyNow'] = true; }
        if (billingAddress) {
            returnValue.shoppingCartDto.addressList.push({
                "addressId": billingAddress.idAddress,
                "type": "billing",
                "invoiceType": invoiceType

            })
        }
        return returnValue
    }

    static getTwoDecimalValue(a) { return Math.floor(a * 100) / 100; }
}