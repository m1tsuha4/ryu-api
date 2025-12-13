export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  children: CategoryNode[];
}
