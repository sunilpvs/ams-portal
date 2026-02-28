import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function AssetTypeTable({
  assetTypes = [],
  assetCategories = [],
  assignmentTypes = [],
  totalCount = 0,
  deleteAssetType = () => {},
  editAssetType = () => {},
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange = () => {},
  onLimitChange = () => {},
  onSearch = () => {},
  searchTerm = "",
  loading = false,
}) {
  const assetCategoryNameById = (assetCategories || []).reduce((acc, category) => {
    if (category?.id !== undefined && category?.id !== null) {
      acc[String(category.id)] = category.asset_category || category.name || "";
    }
    return acc;
  }, {});

  const assignmentTypeNameById = (assignmentTypes || []).reduce((acc, assignment) => {
    if (assignment?.id !== undefined && assignment?.id !== null) {
      acc[String(assignment.id)] = assignment.assignment_type || assignment.name || "";
    }
    return acc;
  }, {});

  const [sortConfig, setSortConfig] = useState({
    key: "asset_type",
    direction: "asc",
  });

  const filteredAssetTypes = assetTypes.filter((item) => {
    const searchValue = String(searchTerm || "").toLowerCase();

    const combinedValues = [
      item?.asset_type,
      assetCategoryNameById[String(item?.asset_category_id)],
      assignmentTypeNameById[String(item?.assignment_type_id)],
    ]
      .map((value) => String(value || "").toLowerCase())
      .join(" ");

    return combinedValues.includes(searchValue);
  });

  const sortedAssetTypes = [...filteredAssetTypes].sort((a, b) => {
    const key = sortConfig.key;
    const direction = sortConfig.direction === "asc" ? 1 : -1;

    const aValue =
      key === "asset_category"
        ? String(assetCategoryNameById[String(a?.asset_category_id)] || "").toLowerCase()
        : key === "assignment_type"
        ? String(assignmentTypeNameById[String(a?.assignment_type_id)] || "").toLowerCase()
        : String(a?.asset_type || a?.[key] || "").toLowerCase();

    const bValue =
      key === "asset_category"
        ? String(assetCategoryNameById[String(b?.asset_category_id)] || "").toLowerCase()
        : key === "assignment_type"
        ? String(assignmentTypeNameById[String(b?.assignment_type_id)] || "").toLowerCase()
        : String(b?.asset_type || b?.[key] || "").toLowerCase();

    if (aValue < bValue) return -1 * direction;
    if (aValue > bValue) return 1 * direction;
    return 0;
  });

  const totalItems =
    Number.isFinite(totalCount) && totalCount > 0 ? totalCount : sortedAssetTypes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssetTypes = sortedAssetTypes;

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
  };

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

  const handleExportExcel = () => {
    const exportData = sortedAssetTypes.map((item, index) => ({
      "Sr. No.": index + 1,
      "Asset Type": item.asset_type || "",
      "Asset Category":
        assetCategoryNameById[String(item.asset_category_id)] || item.asset_category_id || "",
      "Assignment Type":
        assignmentTypeNameById[String(item.assignment_type_id)] || item.assignment_type_id || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asset Types");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(fileData, "Asset_Type_List.xlsx");
  };

  return (
    <Box m="20px">
      <div className="container mt-4 p-3 bg-white rounded shadow-sm">
        <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
          <div className="position-relative me-3 mb-2" style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search Asset Type..."
              value={searchTerm}
              onChange={(event) => {
                onSearch(event.target.value);
                onPageChange(1);
              }}
              className="form-control"
            />
          </div>

          <div className="d-flex align-items-center mb-2">
            <label className="form-label me-2 mb-0">Items per page:</label>

            <select
              className="form-select"
              style={{ width: "120px" }}
              value={itemsPerPage}
              onChange={(event) => {
                onLimitChange(parseInt(event.target.value, 10));
                onPageChange(1);
              }}
            >
              {[5, 10, 20, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>

            <button className="btn btn-success ms-4" onClick={handleExportExcel}>
              Export Excel
            </button>
          </div>
        </div>

        <div style={{ maxHeight: "350px", overflowY: "auto" }}>
          <table className="table table-hover table-bordered align-middle text-center">
            <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th>Sr. No.</th>

                <th onClick={() => handleSort("asset_type")} style={{ cursor: "pointer" }}>
                  Asset Type
                  <span className="float-end">{getSortArrow("asset_type")}</span>
                </th>

                <th onClick={() => handleSort("asset_category")} style={{ cursor: "pointer" }}>
                  Asset Category
                  <span className="float-end">{getSortArrow("asset_category")}</span>
                </th>

                <th onClick={() => handleSort("assignment_type")} style={{ cursor: "pointer" }}>
                  Assignment Type
                  <span className="float-end">{getSortArrow("assignment_type")}</span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-muted">Loading asset types...</td>
                </tr>
              ) : paginatedAssetTypes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-muted">No asset types found.</td>
                </tr>
              ) : (
                paginatedAssetTypes.map((item, index) => (
                  <tr key={item.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{item.asset_type}</td>
                    <td>
                      {assetCategoryNameById[String(item.asset_category_id)] || item.asset_category_id}
                    </td>
                    <td>
                      {assignmentTypeNameById[String(item.assignment_type_id)] || item.assignment_type_id}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => editAssetType(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteAssetType(item.id)}
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

        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <strong style={{ color: "#000" }}>
                Showing {paginatedAssetTypes.length} of {totalItems} asset types
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
                    currentPage === index + 1 ? "btn-primary" : "btn-outline-secondary"
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

AssetTypeTable.propTypes = {
  assetTypes: PropTypes.array,
  assetCategories: PropTypes.array,
  assignmentTypes: PropTypes.array,
  totalCount: PropTypes.number,
  deleteAssetType: PropTypes.func,
  editAssetType: PropTypes.func,
  currentPage: PropTypes.number,
  itemsPerPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onLimitChange: PropTypes.func,
  onSearch: PropTypes.func,
  searchTerm: PropTypes.string,
  loading: PropTypes.bool,
};

export default AssetTypeTable;
