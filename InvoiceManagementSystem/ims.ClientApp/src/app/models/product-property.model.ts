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
