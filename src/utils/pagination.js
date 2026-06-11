// Tạo đối tượng phân trang để truyền cho view
function buildPagination(totalItems, currentPage, pageSize, baseUrl = '', query = {}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(1, parseInt(currentPage) || 1), totalPages);

  // Tạo query string giữ nguyên các filter khác
  const qs = (p) => {
    const params = new URLSearchParams({ ...query, page: p });
    return `${baseUrl}?${params.toString()}`;
  };

  // Danh sách số trang hiển thị (tối đa 5 quanh trang hiện tại)
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return {
    totalItems,
    totalPages,
    currentPage: page,
    pageSize,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    prevUrl: page > 1 ? qs(page - 1) : null,
    nextUrl: page < totalPages ? qs(page + 1) : null,
    pages,
    url: qs,
    offset: (page - 1) * pageSize,
    from: totalItems === 0 ? 0 : (page - 1) * pageSize + 1,
    to: Math.min(page * pageSize, totalItems),
  };
}

module.exports = { buildPagination };
