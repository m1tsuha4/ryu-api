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

export interface CategoryPath {
  id: string;
  name: string;
  slug: string;
};

export function findCategoryPath(
  nodes: any[],
  targetId: string,
  path: CategoryPath[] = [],
): CategoryPath[] | null {
  for (const node of nodes) {
    const newPath = [...path, {
      id: node.id,
      name: node.name,
      slug: node.slug,
    }];

    if (node.id === targetId) {
      return newPath;
    }

    if (node.children?.length) {
      const found = findCategoryPath(node.children, targetId, newPath);
      if (found) return found;
    }
  }
  return null;
}
