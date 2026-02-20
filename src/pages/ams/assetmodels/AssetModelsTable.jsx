import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function AssetModelsTable({
  models = [],
  totalCount = 0,
  deleteModel = () => {},
  editModel = () => {},
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange = () => {},
  onLimitChange = () => {},
  onSearch = () => {},
  searchTerm = "",
  loading = false,
}) {
  const [sortConfig, setSortConfig] = useState({
    key: "model",
    direction: "asc",
  });

  /* -------------------- SAFE FILTER -------------------- */
  const filteredModels = models.filter((item) => {
    const searchValue = String(searchTerm || "").toLowerCase();

    const combinedValues = [
      item?.model,
      item?.config,
      item?.category_name,
      item?.brand_name,
    ]
      .map((val) => String(val || "").toLowerCase())
      .join(" ");

    return combinedValues.includes(searchValue);
  });

  /* -------------------- SORT -------------------- */
  const sortedModels = [...filteredModels].sort((a, b) => {
    const key = sortConfig.key;
    const direction = sortConfig.direction === "asc" ? 1 : -1;

    const aValue = String(a?.[key] || "").toLowerCase();
    const bValue = String(b?.[key] || "").toLowerCase();

    if (aValue < bValue) return -1 * direction;
    if (aValue > bValue) return 1 * direction;
    return 0;
  });

  /* -------------------- PAGINATION -------------------- */
  const totalItems =
    Number.isFinite(totalCount) && totalCount > 0
      ? totalCount
      : sortedModels.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedModels = sortedModels.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
      return sortConfig.direction === "asc" ? " ▲" : " ▼";
    }
    return "";
  };

  /* -------------------- EXPORT -------------------- */
  const handleExportExcel = () => {
    const exportData = sortedModels.map((item, index) => ({
      "Sr. No.": index + 1,
      ID: item.id,
      "Asset Category": item.category_name,
      "Asset Brand": item.brand_name,
      Model: item.model,
      Configuration: item.config,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asset Models");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(fileData, "Asset_Model_List.xlsx");
  };

  return (
    <Box m="20px">
      <div className="container mt-4 p-3 bg-white rounded shadow-sm">

        {/* SEARCH + EXPORT + LIMIT */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">

          <input
            type="text"
            placeholder="Search Asset Model..."
            value={searchTerm}
            onChange={(e) => {
              onSearch(String(e.target.value || ""));
              onPageChange(1);
            }}
            className="form-control me-3 mb-2"
            style={{ maxWidth: "300px" }}
          />

          <div className="d-flex align-items-center mb-2">
            <label className="me-2">Items per page:</label>

            <select
              className="form-select"
              style={{ width: "100px" }}
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
              className="btn btn-success ms-3"
              onClick={handleExportExcel}
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <table className="table table-bordered table-hover text-center align-middle">
            <thead
              className="table-dark"
              style={{ position: "sticky", top: 0 }}
            >
              <tr>
                <th>Sr. No.</th>

                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("category_name")}
                >
                  Asset Category{getSortArrow("category_name")}
                </th>

                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("brand_name")}
                >
                  Asset Brand{getSortArrow("brand_name")}
                </th>

                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("model")}
                >
                  Model{getSortArrow("model")}
                </th>

                <th
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSort("config")}
                >
                  Configuration{getSortArrow("config")}
                </th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading...</td>
                </tr>
              ) : paginatedModels.length === 0 ? (
                <tr>
                  <td colSpan="6">No asset models found.</td>
                </tr>
              ) : (
                paginatedModels.map((item, index) => (
                  <tr key={item.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{item.category_name}</td>
                    <td>{item.brand_name}</td>
                    <td>{item.model}</td>
                    <td>{item.config}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => editModel(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteModel(item.id)}
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

        {/* SIMPLE PAGE INFO */}
        <div className="mt-3 text-center">
          Page {currentPage} of {totalPages}
        </div>

      </div>
    </Box>
  );
}

/* -------------------- PROP TYPES -------------------- */
AssetModelsTable.propTypes = {
  models: PropTypes.array,
  totalCount: PropTypes.number,
  deleteModel: PropTypes.func,
  editModel: PropTypes.func,
  currentPage: PropTypes.number,
  itemsPerPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onLimitChange: PropTypes.func,
  onSearch: PropTypes.func,
  searchTerm: PropTypes.string,
  loading: PropTypes.bool,
};

export default AssetModelsTable;