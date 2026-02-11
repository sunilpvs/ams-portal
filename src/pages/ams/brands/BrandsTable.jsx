import PropTypes from "prop-types";
import { Box } from "@mui/material";

import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function BrandsTable({
  brands,
  totalCount,
  deleteBrand,
  editBrand,
  currentPage,
  itemsPerPage,
  onPageChange,
  onLimitChange,
  onSearch,
  searchTerm,
  loading,
}) {
  const [sortConfig, setSortConfig] = useState({
    key: "brand",
    direction: "asc",
  });

  /* -------------------- FILTER -------------------- */
  const filteredBrands = brands.filter((brand) =>
    (brand.brand || brand.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  /* -------------------- SORT -------------------- */
  const sortedBrands = [...filteredBrands].sort((a, b) => {
    const key = sortConfig.key;
    const dir = sortConfig.direction === "asc" ? 1 : -1;

    const aValue = (a[key] || a.brand || a.name || "").toLowerCase();
    const bValue = (b[key] || b.brand || b.name || "").toLowerCase();

    if (aValue < bValue) return -1 * dir;
    if (aValue > bValue) return 1 * dir;
    return 0;
  });

  /* -------------------- PAGINATION -------------------- */
  const totalItems = Number.isFinite(totalCount) && totalCount > 0
    ? totalCount
    : sortedBrands.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBrands = sortedBrands;

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
  };

  /* -------------------- SORT HANDLER -------------------- */
  const handleSort = (column) => {
    if (sortConfig.key === column) {
      setSortConfig({
        key: column,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key: column, direction: "asc" });
    }
  };

  const getSortArrow = (column) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === "asc" ? "▲" : "▼";
    }
    return "";
  };

  /* -------------------- EXPORT TO EXCEL -------------------- */
  const handleExportExcel = () => {
    const exportData = sortedBrands.map((brand, index) => ({
      "Sr. No.": index + 1,
      Brand: brand.brand || brand.name || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Brands");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(fileData, "Brand_List.xlsx");
  };

  return (
    <Box m="20px">
  

      <div className="container mt-4 p-3 bg-white rounded shadow-sm">

        {/* Search + Export + Limit */}
        <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">

          {/* Search */}
          <div
            className="position-relative me-3 mb-2"
            style={{ flex: 1, minWidth: "200px" }}
          >
            <input
              type="text"
              placeholder="Search Brand..."
              value={searchTerm}
              onChange={(e) => {
                onSearch(e.target.value);
                onPageChange(1);
              }}
              className="form-control"
            />
          </div>

          {/* Limit + Export */}
          <div className="d-flex align-items-center mb-2">
            <label className="form-label me-2 mb-0 text-body">
              Items per page:
            </label>

            <select
              className="form-select"
              style={{ width: "120px" }}
              value={itemsPerPage}
              onChange={(e) => {
                onLimitChange(parseInt(e.target.value, 10));
                onPageChange(1);
              }}
            >
              {[5, 10, 20, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>

            <button
              className="btn btn-success ms-4"
              onClick={handleExportExcel}
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table table-hover table-bordered align-middle text-center">
            <thead className="table-dark">
              <tr>
                <th>Sr. No.</th>
                <th onClick={() => handleSort("brand")} style={{ cursor: "pointer" }}>
                  Brand <span className="float-end">{getSortArrow("brand")}</span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
  {loading ? (
    <tr>
      <td colSpan="3" className="text-muted">
        Loading brands...
      </td>
    </tr>
  ) : paginatedBrands.length === 0 ? (
    <tr>
      <td colSpan="3" className="text-muted">
        No brands found.
      </td>
    </tr>
  ) : (
    paginatedBrands.map((data, index) => (
      <tr key={data.id}>
        <td>{startIndex + index + 1}</td>
        <td>{data.brand || data.name}</td>
        <td>
          <button
            className="btn btn-sm btn-outline-primary me-2"
            onClick={() => editBrand(data)}
          >
            Edit
          </button>

          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => deleteBrand(data.id)}
          >
            Delete
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
<div className="d-flex flex-wrap justify-content-between align-items-center mt-3">

  {/* Showing Text */}
  <div className="text-nowrap">
    <strong style={{ color: "#000" }}>
      Showing {paginatedBrands.length} of {totalItems} brands
    </strong>
  </div>

  {/* Pagination Buttons */}
  <div className="mb-2">
    <button
      className="btn btn-outline-secondary btn-sm me-1"
      onClick={() => goToPage(currentPage - 1)}
      disabled={currentPage === 1}
    >
      Prev
    </button>

    {[...Array(totalPages)].map((_, index) => (
      <button
        key={index}
        className={`btn btn-sm me-1 ${
          currentPage === index + 1
            ? "btn-primary"
            : "btn-outline-secondary"
        }`}
        onClick={() => goToPage(index + 1)}
      >
        {index + 1}
      </button>
    ))}

    <button
      className="btn btn-outline-secondary btn-sm"
      onClick={() => goToPage(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      Next
    </button>
  </div>

</div>
  )}
      </div>
    </Box>
  );
}

/* -------------------- PROP TYPES -------------------- */
BrandsTable.propTypes = {
  brands: PropTypes.array.isRequired,
  totalCount: PropTypes.number.isRequired,
  deleteBrand: PropTypes.func.isRequired,
  editBrand: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onLimitChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default BrandsTable;
