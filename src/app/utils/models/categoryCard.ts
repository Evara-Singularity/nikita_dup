export interface CategoryCardObject {
  page: string;
  image: string;
  title: string;
  item?: CategoryCardItem;
  isSelected?: boolean;
}

export interface CategoryCardItem {
  CategoryName: string;
  category_image: string;
  category_url: string;
  idCategory: string;
}
