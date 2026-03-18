const usePagination = (items = [], page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

export default usePagination;

