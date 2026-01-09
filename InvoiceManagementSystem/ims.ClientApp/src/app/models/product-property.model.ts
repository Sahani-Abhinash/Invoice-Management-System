// Product Property Models
export interface ProductProperty {
    id: string;
    name: string;
    description?: string;
    displayOrder: number;
}

export interface CreateProductPropertyDto {
    name: string;
    description?: string;
    displayOrder: number;
}

// Property Attribute Models
export interface PropertyAttribute {
    id: string;
    productPropertyId: string;
    productPropertyName: string;
    value: string;
    description?: string;
    displayOrder: number;
    metadata?: string;
}

export interface CreatePropertyAttributeDto {
    productPropertyId: string;
    value: string;
    description?: string;
    displayOrder: number;
    metadata?: string;
}

// Item Property Attribute Models (for assigning properties to items)
export interface ItemPropertyAttribute {
    id: string;
    itemId: string;
    propertyAttributeId: string;
    propertyName?: string;
    propertyAttributeName?: string;
    attributeValue?: string;
    notes?: string;
    displayOrder: number;
}

export interface CreateItemPropertyAttributeDto {
    itemId: string;
    propertyAttributeId: string;
    notes?: string;
    displayOrder: number;
}

export interface UpdateItemPropertyAttributeDto {
    id: string;
    itemId: string;
    propertyAttributeId: string;
    notes?: string;
    displayOrder: number;
}

// Item Price Variant Models (for product variants like Color, Size with different prices)
export interface ItemPriceVariant {
    id: string;
    itemPriceId: string;
    propertyAttributeId: string;
    propertyName?: string;           // e.g., "Color"
    attributeValue?: string;         // e.g., "White"
    displayLabel?: string;           // e.g., "Color: White"
    displayOrder: number;
    stockQuantity?: number;
    variantSKU?: string;
    price?: number;                  // Inherited from ItemPrice
    itemName?: string;               // For display convenience
}

export interface CreateItemPriceVariantDto {
    itemPriceId: string;
    propertyAttributeId: string;
    displayOrder?: number;
    stockQuantity?: number;
    variantSKU?: string;
}

export interface UpdateItemPriceVariantDto {
    id: string;
    itemPriceId: string;
    propertyAttributeId: string;
    displayOrder: number;
    stockQuantity?: number;
    variantSKU?: string;
}
