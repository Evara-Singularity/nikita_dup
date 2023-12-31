export interface SearchResponse {
    productSearchResult: ProductSearchResult;
    relatedSearches?: null;
    buckets?: (BucketsEntity)[] | null;
    title?: null;
    desciption?: null;
    metaDesciption?: null;
    shortDesciption?: null;
    heading?: null;
    brandName?: null;
    categoryName?: null;
    categoryLinkList?: null;
    productTagName?: null;
    redirectionLink?: null;
    minPrice: number;
    maxPrice: number;
    categoriesRecommended?: null;
}

export interface ProductSearchResult {
    totalCount: number;
    products?: (ProductsEntity)[] | null;
    inputSearchString: string;
    correctedSearchString: string;
    highlightedSearchString?: null;
    displayString: string;
    searchDisplayOperation: string;
}

export interface ProductsEntity {
    moglixPartNumber: string;
    moglixProductNo?: null;
    mrp: number;
    salesPrice: number;
    priceWithoutTax: number;
    productName: string;
    variantName: string;
    productMinimmumQuantity?: number;
    productUrl: string;
    shortDesc: string;
    brandId: string;
    brandName: string;
    quantityAvailable: number;
    discount: any;
    rating?: null;
    categoryCodes?: null;
    taxonomy?: null;
    mainImageLink: string;
    mainImageThumnailLink?: string;
    mainImageMediumLink?: string;
    productTags?: any ;
    filterableAttributes?: FilterableAttributes;
    itemInPack: string;
    ratingCount: number;
    reviewCount: number;
    avgRating: number;
    uclid?: string;
    keyFeatures?: string[];
    internalProduct?: boolean; // used in case of sponsered Ad
    outOfStock?: boolean;
    description?:string;
    short_description?: null;
    homePageRFQ?:boolean;
    HomePageRFQstatus?:HomePageRFQstatus;
    attributeValuesForPart?: any;
    promoCodeDescription?: string;
    acceptLanguage?: any;
}

export interface FilterableAttributes {
}
export interface HomePageRFQstatus{
    status:string;
    qty:number;
    createdOn:Date;
    rfqId:number;
}

export interface BucketsEntity {
    name: string;
    terms?: (TermsEntity)[] | null;
}

export interface TermsEntity {
    term: string;
    count: number;
    selected: boolean;
    enabled: boolean;
    weight: number;
    maxPrice: number;
    minPrice: number;
    childCategories?: null;
    childCategoryList?: null;
}

export interface ProductListingDataEntity { 
    totalCount: number, 
    products: ProductsEntity[],
    listingHeading: string,
    filterData?: any,
}

export interface ProductCardFeature {
    enableBuyNow: Boolean,
    enableAddToCart: Boolean,
    enableFeatures: Boolean,
    enableRating: Boolean,
    enableCard: Boolean,
    enableVideo: Boolean,
    enableFullAddToCart?: Boolean
    verticalOrientation: Boolean,
    horizontalOrientation: Boolean,
    verticalOrientationV2?: Boolean,
    lazyLoadImage: Boolean,
}
export interface ProductCardMetaInfo {
    redirectedSectionName?: string,
    redirectedIdentifier?: string
}
