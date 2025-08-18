// src/common/helpers/pagination.helper.ts

import { PaginationInfo } from "../interfaces";


// Impor interface PaginationInfo yang sudah kita buat

interface PaginationOptions {
  page: number;
  limit: number;
  totalItems: number;
}

export function createPaginationInfo(options: PaginationOptions): PaginationInfo {
  const { page, limit, totalItems } = options;

  // 1. Hitung total halaman
  const totalPages = Math.ceil(totalItems / limit);

  // 2. Tentukan halaman sebelumnya
  const previousPage = page > 1 ? page - 1 : null;

  // 3. Tentukan halaman berikutnya
  const nextPage = page < totalPages ? page + 1 : null;

  // 4. Kembalikan objek PaginationInfo yang lengkap
  return {
    totalItems,
    itemsPerPage: limit,
    currentPage: page,
    totalPages,
    nextPage,
    previousPage,
  };
}