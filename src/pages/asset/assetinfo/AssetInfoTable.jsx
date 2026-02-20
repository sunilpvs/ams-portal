import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AssetInfoTable = ({
  assets = [],
  deleteAsset = () => {},
  editAsset = () => {},
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange = () => {},
  onLimitChange = () => {},
  onSearch = () => {},
  searchTerm = "",
  loading = false,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: "asset_model_id", direction: "asc" });

  const filteredAssets = assets.filter((item) => {
    const searchValue = String(searchTerm || "").toLowerCase();
    const combined = [
      item.asset_model_id,
      item.asset_serial_number,
      item.asset_purchase_date,
      item.asset_price,
      item.asset_warranty_expiry,
    ]
      .map((v) => String(v || "").toLowerCase())
      .join(" ");
    return combined.includes(searchValue);
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    const key = sortConfig.key;
    const dir = sortConfig.direction === "asc" ? 1 : -1;
    const aVal = String(a[key] || "").toLowerCase();
    const bVal = String(b[key] || "").toLowerCase();
    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    return 0;
  });

  const totalItems = sortedAssets.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = sortedAssets.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column) => {
    if (sortConfig.key === column) {
      setSortConfig({ key: column, direction: sortConfig.direction === "asc" ? "desc" : "asc" });
    } else setSortConfig({ key: column, direction: "asc" });
  };

  const getSortArrow = (col) => (sortConfig.key === col ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : "");

  const handleExportExcel = () => {
    const exportData = sortedAssets.map((item, idx) => ({
      "Sr. No.": idx + 1,
      "Asset Model ID": item.asset_model_id,
      "Serial Number": item.asset_serial_number,
      "Purchase Date": item.asset_purchase_date,
      Price: item.asset_price,
      "Warranty Expiry": item.asset_warranty_expiry,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assets");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), "AssetInfo.xlsx");
  };

  return (
    <Box m="20px">
      <div className="container mt-4 p-3 bg-white rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <input
            type="text"
            placeholder="Search Asset Info..."
            value={searchTerm}
            onChange={(e) => { onSearch(String(e.target.value || "")); onPageChange(1); }}
            className="form-control me-3 mb-2"
            style={{ maxWidth: "300px" }}
          />
          <div className="d-flex align-items-center mb-2">
            <label className="me-2">Items per page:</label>
            <select
              className="form-select"
              style={{ width: "100px" }}
              value={itemsPerPage}
              onChange={(e) => { onLimitChange(parseInt(e.target.value, 10)); onPageChange(1); }}
            >
              {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button className="btn btn-success ms-3" onClick={handleExportExcel}>Export Excel</button>
          </div>
        </div>

        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          <table className="table table-bordered table-hover text-center align-middle">
            <thead className="table-dark" style={{ position: "sticky", top: 0 }}>
              <tr>
                <th>Sr. No.</th>
                <th style={{cursor:"pointer"}} onClick={()=>handleSort("asset_model_id")}>Asset Model ID{getSortArrow("asset_model_id")}</th>
                <th style={{cursor:"pointer"}} onClick={()=>handleSort("asset_serial_number")}>Serial Number{getSortArrow("asset_serial_number")}</th>
                <th style={{cursor:"pointer"}} onClick={()=>handleSort("asset_purchase_date")}>Purchase Date{getSortArrow("asset_purchase_date")}</th>
                <th style={{cursor:"pointer"}} onClick={()=>handleSort("asset_price")}>Price{getSortArrow("asset_price")}</th>
                <th style={{cursor:"pointer"}} onClick={()=>handleSort("asset_warranty_expiry")}>Warranty Expiry{getSortArrow("asset_warranty_expiry")}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7">Loading...</td></tr>
              ) : paginatedAssets.length === 0 ? (
                <tr><td colSpan="7">No asset info found.</td></tr>
              ) : paginatedAssets.map((item, idx) => (
                <tr key={idx}>
                  <td>{startIndex+idx+1}</td>
                  <td>{item.asset_model_id}</td>
                  <td>{item.asset_serial_number}</td>
                  <td>{item.asset_purchase_date}</td>
                  <td>{item.asset_price}</td>
                  <td>{item.asset_warranty_expiry}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={()=>editAsset(item)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={()=>deleteAsset(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-center">Page {currentPage} of {Math.max(1, Math.ceil(totalItems/itemsPerPage))}</div>
      </div>
    </Box>
  );
};

AssetInfoTable.propTypes = {
  assets: PropTypes.array,
  deleteAsset: PropTypes.func,
  editAsset: PropTypes.func,
  currentPage: PropTypes.number,
  itemsPerPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onLimitChange: PropTypes.func,
  onSearch: PropTypes.func,
  searchTerm: PropTypes.string,
  loading: PropTypes.bool,
};

export default AssetInfoTable;