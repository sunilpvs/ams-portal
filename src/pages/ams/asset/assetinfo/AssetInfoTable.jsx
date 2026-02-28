import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function AssetInfoTable({
  assetInfos = [],
  assetModels = [],
  totalCount = 0,
  deleteAssetInfo = () => {},
  editAssetInfo = () => {},
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange = () => {},
  onLimitChange = () => {},
  onSearch = () => {},
  searchTerm = "",
  loading = false,
}) {
  const modelNameById = (assetModels || []).reduce((acc, model) => {
    if (model?.id !== undefined && model?.id !== null) {
      acc[String(model.id)] = model.asset_model || model.model || model.name || "";
    }
    return acc;
  }, {});

  const [sortConfig, setSortConfig] = useState({
    key: "asset_serial_number",
    direction: "asc",
  });

  const filteredAssetInfo = assetInfos.filter((item) => {
    const searchValue = String(searchTerm || "").toLowerCase();

    const combinedValues = [
      item?.asset_serial_number,
      item?.asset_purchase_date,
      item?.asset_price,
      item?.asset_warranty_expiry,
      modelNameById[String(item?.asset_model_id)],
    ]
      .map((value) => String(value || "").toLowerCase())
      .join(" ");

    return combinedValues.includes(searchValue);
  });

  const sortedAssetInfo = [...filteredAssetInfo].sort((a, b) => {
    const key = sortConfig.key;
    const direction = sortConfig.direction === "asc" ? 1 : -1;

    const aValue =
      key === "asset_model"
        ? String(modelNameById[String(a?.asset_model_id)] || "").toLowerCase()
        : String(a?.[key] || "").toLowerCase();

    const bValue =
      key === "asset_model"
        ? String(modelNameById[String(b?.asset_model_id)] || "").toLowerCase()
        : String(b?.[key] || "").toLowerCase();

    if (aValue < bValue) return -1 * direction;
    if (aValue > bValue) return 1 * direction;
    return 0;
  });

  const totalItems =
    Number.isFinite(totalCount) && totalCount > 0 ? totalCount : sortedAssetInfo.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssetInfo = sortedAssetInfo;

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

  const handleExportExcel = () => {
    const exportData = sortedAssetInfo.map((item, index) => ({
      "Sr. No.": index + 1,
      "Asset Serial Number": item.asset_serial_number || "",
      "Asset Purchase Date": item.asset_purchase_date || "",
      "Asset Price": item.asset_price || "",
      "Asset Warranty Expiry": item.asset_warranty_expiry || "",
      "Asset Model": modelNameById[String(item.asset_model_id)] || item.asset_model_id || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asset Info");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(fileData, "Asset_Info_List.xlsx");
  };

  return (
    <Box m="20px">
      <div className="container mt-4 p-3 bg-white rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <input
            type="text"
            placeholder="Search Asset Info..."
            value={searchTerm}
            onChange={(event) => {
              onSearch(String(event.target.value || ""));
              onPageChange(1);
            }}
            className="form-control me-3 mb-2"
            style={{ maxWidth: "320px" }}
          />

          <div className="d-flex align-items-center mb-2">
            <label className="me-2">Items per page:</label>

            <select
              className="form-select"
              style={{ width: "100px" }}
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

            <button className="btn btn-success ms-3" onClick={handleExportExcel}>
              Export Excel
            </button>
          </div>
        </div>

        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <table className="table table-bordered table-hover text-center align-middle">
            <thead className="table-dark" style={{ position: "sticky", top: 0 }}>
              <tr>
                <th>Sr. No.</th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("asset_serial_number")}>
                  Asset Serial Number{getSortArrow("asset_serial_number")}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("asset_purchase_date")}>
                  Purchase Date{getSortArrow("asset_purchase_date")}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("asset_price")}>
                  Asset Price{getSortArrow("asset_price")}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("asset_warranty_expiry")}>
                  Warranty Expiry{getSortArrow("asset_warranty_expiry")}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("asset_model")}>
                  Asset Model{getSortArrow("asset_model")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading...</td>
                </tr>
              ) : paginatedAssetInfo.length === 0 ? (
                <tr>
                  <td colSpan="7">No asset info found.</td>
                </tr>
              ) : (
                paginatedAssetInfo.map((item, index) => (
                  <tr key={item.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{item.asset_serial_number}</td>
                    <td>{item.asset_purchase_date}</td>
                    <td>{item.asset_price}</td>
                    <td>{item.asset_warranty_expiry}</td>
                    <td>{modelNameById[String(item.asset_model_id)] || item.asset_model_id}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => editAssetInfo(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteAssetInfo(item.id)}
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
                Showing {paginatedAssetInfo.length} of {totalItems} asset info records
              </strong>
            </div>

            <div>
              <button
                className="btn btn-outline-secondary btn-sm me-1"
                onClick={() => onPageChange(currentPage - 1)}
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
                  onClick={() => onPageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => onPageChange(currentPage + 1)}
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

AssetInfoTable.propTypes = {
  assetInfos: PropTypes.array,
  assetModels: PropTypes.array,
  totalCount: PropTypes.number,
  deleteAssetInfo: PropTypes.func,
  editAssetInfo: PropTypes.func,
  currentPage: PropTypes.number,
  itemsPerPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onLimitChange: PropTypes.func,
  onSearch: PropTypes.func,
  searchTerm: PropTypes.string,
  loading: PropTypes.bool,
};

export default AssetInfoTable;