import { ResponseCategoryDTO } from '../dto/response/categories/response-category.dto.js';

type CategoryDocumentLike = {
  _id: unknown;
  category: string;
  userId?: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export class CategoryMapper {
  static toDto(category: CategoryDocumentLike): ResponseCategoryDTO {
    return {
      id: String(category._id),
      category: category.category,
      ...(category.userId ? { userId: String(category.userId) } : {}),
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}
