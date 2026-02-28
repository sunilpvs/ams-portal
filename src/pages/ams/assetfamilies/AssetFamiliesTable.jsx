import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function AssetFamiliesTable({
  families = [],   // ✅ SAFE DEFAULT
  totalCount = 0,
  deleteFamily = () => {},
  editFamily = () => {},
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange = () => {},
  onLimitChange = () => {},
  onSearch = () => {},
  searchTerm = "",
  loading = false,
}) {

  const [sortConfig, setSortConfig] = useState({
    key: "family",
    direction: "asc",
  });

  /* -------------------- SAFE FILTER -------------------- */
  const filteredFamilies = (families || []).filter((family) =>
    (family?.family || family?.name || "")
      .toLowerCase()
      .includes((searchTerm || "").toLowerCase())
  );

  /* -------------------- SORT -------------------- */
  const sortedFamilies = [...filteredFamilies].sort((a, b) => {
    const key = sortConfig.key;
    const dir = sortConfig.direction === "asc" ? 1 : -1;

    const aValue = (a?.[key] || a?.family || a?.name || "").toLowerCase();
    const bValue = (b?.[key] || b?.family || b?.name || "").toLowerCase();

    if (aValue < bValue) return -1 * dir;
    if (aValue > bValue) return 1 * dir;
    return 0;
  });

  /* -------------------- PAGINATION -------------------- */
  const totalItems =
    Number.isFinite(totalCount) && totalCount > 0
      ? totalCount
      : sortedFamilies.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFamilies = sortedFamilies.slice(startIndex, startIndex + itemsPerPage);

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

  /* -------------------- EXPORT -------------------- */
  const handleExportExcel = () => {
    const exportData = sortedFamilies.map((family, index) => ({
      "Sr. No.": index + 1,
      "Asset Family": family?.asset_family || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asset Families");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(fileData, "Asset_Family_List.xlsx");
  };

  return (
    <Box m="20px">
      <div className="container mt-4 p-3 bg-white rounded shadow-sm">

        {/* SEARCH + EXPORT + LIMIT */}
        <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">

          <div className="position-relative me-3 mb-2" style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search Asset Family..."
              value={searchTerm}
              onChange={(e) => {
                onSearch(e.target.value);
                onPageChange(1);
              }}
              className="form-control"
            />
          </div>

          <div className="d-flex align-items-center mb-2">
            <label className="form-label me-2 mb-0">
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
        <div style={{ maxHeight: "350px", overflowY: "auto" }}>
          <table className="table table-hover table-bordered align-middle text-center">
            <thead
              className="table-dark"
              style={{ position: "sticky", top: 0, zIndex: 1 }}
            >
              <tr>
                <th>Sr. No.</th>
                <th
                  onClick={() => handleSort("family")}
                  style={{ cursor: "pointer" }}
                >
                  Asset Family
                  <span className="float-end">
                    {getSortArrow("family")}
                  </span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-muted">
                    Loading asset families...
                  </td>
                </tr>
              ) : paginatedFamilies.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-muted">
                    No asset families found.
                  </td>
                </tr>
              ) : (
                paginatedFamilies.map((data, index) => (
                  <tr key={data.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{data?.asset_family}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => editFamily(data)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteFamily(data.id)}
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
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <strong style={{ color: "#000" }}>
                Showing {paginatedFamilies.length} of {totalItems} asset families
              </strong>
            </div>

            <div>
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
AssetFamiliesTable.propTypes = {
  families: PropTypes.array,
  totalCount: PropTypes.number,
  deleteFamily: PropTypes.func,
  editFamily: PropTypes.func,
  currentPage: PropTypes.number,
  itemsPerPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onLimitChange: PropTypes.func,
  onSearch: PropTypes.func,
  searchTerm: PropTypes.string,
  loading: PropTypes.bool,
};

export default AssetFamiliesTable;
