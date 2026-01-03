export enum CategoryType {
  Income = 1,
  Expense = 2
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: CategoryType;
  typeName: string;
  isSystemCategory: boolean;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  type: CategoryType;
}
