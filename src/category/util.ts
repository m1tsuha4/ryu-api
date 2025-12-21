export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  children: CategoryNode[];
  productCount?: number;
}

export function findNodeById(
  nodes: CategoryNode[],
  id: string,
): CategoryNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return null;
}
