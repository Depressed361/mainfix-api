export interface Category {
  id: string;
  companyId: string;
  key: string;
  label: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryProps {
  companyId: string;
  key: string;
  label: string;
}
