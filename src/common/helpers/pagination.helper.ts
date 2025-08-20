// src/common/helpers/pagination.helper.ts

import { PaginationInfo } from "../interfaces";


// Import PaginationInfo interface that we created

interface PaginationOptions {
  page: number;
  limit: number;
  totalItems: number;
}

export function createPaginationInfo(options: PaginationOptions): PaginationInfo {
  const { page, limit, totalItems } = options;

  // 1. Hitung total halaman
  const totalPages = Math.ceil(totalItems / limit);

  // 2. Determine previous page
  const previousPage = page > 1 ? page - 1 : null;

  // 3. Determine next page
  const nextPage = page < totalPages ? page + 1 : null;

  // 4. Return complete PaginationInfo object
  return {
    totalItems,
    itemsPerPage: limit,
    currentPage: page,
    totalPages,
    nextPage,
    previousPage,
  };
}