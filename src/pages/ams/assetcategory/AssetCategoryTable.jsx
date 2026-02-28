import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function AssetCategoryTable({
  assetCategories = [],
  assetFamilies = [],
  totalCount = 0,
  deleteAssetCategory = () => {},
  editAssetCategory = () => {},
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange = () => {},
  onLimitChange = () => {},
  onSearch = () => {},
  searchTerm = "",
  loading = false,
}) {
  const assetFamilyNameById = (assetFamilies || []).reduce((acc, family) => {
    if (family?.id !== undefined && family?.id !== null) {
      acc[String(family.id)] = family.family || family.name || family.asset_family || "";
    }
    return acc;
  }, {});

  const [sortConfig, setSortConfig] = useState({
    key: "asset_category",
    direction: "asc",
  });

  /* -------------------- FILTER -------------------- */
  const filteredAssetCategories = assetCategories.filter((item) =>
    (item?.asset_category || item?.category || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  /* -------------------- SORT -------------------- */
  const sortedAssetCategories = [...filteredAssetCategories].sort((a, b) => {
    const key = sortConfig.key;
    const dir = sortConfig.direction === "asc" ? 1 : -1;

    const aValue = (a?.[key] || a?.asset_category || a?.category || "").toString().toLowerCase();
    const bValue = (b?.[key] || b?.asset_category || b?.category || "").toString().toLowerCase();

    if (aValue < bValue) return -1 * dir;
    if (aValue > bValue) return 1 * dir;
    return 0;
  });

  /* -------------------- PAGINATION -------------------- */
  const totalItems =
    Number.isFinite(totalCount) && totalCount > 0
      ? totalCount
      : sortedAssetCategories.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedAssetCategories = sortedAssetCategories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
    const exportData = sortedAssetCategories.map((item, index) => ({
      "Sr. No.": index + 1,
      "ID": item.id,
      "Asset Category": item.asset_category || item.category || "",
      "Asset Family":
        assetFamilyNameById[String(item.family_id || item.asset_family_id)] ||
        item.family_id ||
        item.asset_family_id ||
        "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asset Categories");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(fileData, "Asset_Category_List.xlsx");
  };

  return (
    <Box m="20px">
      <div className="container mt-4 p-3 bg-white rounded shadow-sm">

        {/* SEARCH + EXPORT + LIMIT */}
        <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">

          <div className="position-relative me-3 mb-2" style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search Asset Category..."
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
                  onClick={() => handleSort("asset_category")}
                  style={{ cursor: "pointer" }}
                >
                  Asset Category
                  <span className="float-end">
                    {getSortArrow("asset_category")}
                  </span>
                </th>
                <th>Asset Family</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading...</td>
                </tr>
              ) : paginatedAssetCategories.length === 0 ? (
                <tr>
                  <td colSpan="5">No asset categories found.</td>
                </tr>
              ) : (
                paginatedAssetCategories.map((item, index) => (
                  <tr key={item.id}>
                    <td>{startIndex + index + 1}</td>
                   
                    <td>{item.asset_category || item.category}</td>
                    <td>
                      {assetFamilyNameById[String(item.family_id || item.asset_family_id)] ||
                        item.family_id ||
                        item.asset_family_id}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => editAssetCategory(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteAssetCategory(item.id)}
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

      </div>
    </Box>
  );
}

/* -------------------- PROP TYPES -------------------- */
AssetCategoryTable.propTypes = {
  assetCategories: PropTypes.array,
  assetFamilies: PropTypes.array,
  totalCount: PropTypes.number,
  deleteAssetCategory: PropTypes.func,
  editAssetCategory: PropTypes.func,
  currentPage: PropTypes.number,
  itemsPerPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onLimitChange: PropTypes.func,
  onSearch: PropTypes.func,
  searchTerm: PropTypes.string,
  loading: PropTypes.bool,
};

export default AssetCategoryTable;
