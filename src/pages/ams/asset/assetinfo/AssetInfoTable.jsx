import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { getAssetBrandInfoFromModelId } from "../../../../services/ams/assetModelService";

function AssetInfoTable({
  assetInfos = [],
  assetFamilies = [],
  assetCategories = [],
  assetTypes = [],
  assetBrands = [],
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
  const TOTAL_COLUMNS = 12;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB").replaceAll("/", "-");
  }

  const familyNameById = (assetFamilies || []).reduce((acc, family) => {
    if (family?.id !== undefined && family?.id !== null) {
      acc[String(family.id)] = family.family || family.asset_family || family.name || "";
    }
    return acc;
  }, {});

  const categoryNameById = (assetCategories || []).reduce((acc, category) => {
    if (category?.id !== undefined && category?.id !== null) {
      acc[String(category.id)] =
        category.asset_category || category.category_name || category.name || "";
    }
    return acc;
  }, {});

  const typeNameById = (assetTypes || []).reduce((acc, type) => {
    if (type?.id !== undefined && type?.id !== null) {
      acc[String(type.id)] = type.asset_type || type.type_name || type.name || "";
    }
    return acc;
  }, {});

  const brandNameById = (assetBrands || []).reduce((acc, brand) => {
    if (brand?.id !== undefined && brand?.id !== null) {
      acc[String(brand.id)] = brand.brand || brand.brand_name || brand.name || "";
    }
    return acc;
  }, {});

  const modelNameById = (assetModels || []).reduce((acc, model) => {
    if (model?.id !== undefined && model?.id !== null) {
      acc[String(model.id)] = model.asset_model || model.model || model.name || "";
    }
    return acc;
  }, {});

  const [brandInfoByModelId, setBrandInfoByModelId] = useState({});

  useEffect(() => {
    const fetchBrandInfoByModel = async () => {
      const uniqueModelIds = Array.from(
        new Set(
          (assetInfos || [])
            .map((item) => item?.asset_model_id)
            .filter((modelId) => modelId !== undefined && modelId !== null && modelId !== "")
            .map((modelId) => String(modelId))
        )
      );

      const pendingModelIds = uniqueModelIds.filter(
        (modelId) => !brandInfoByModelId[modelId]
      );

      if (pendingModelIds.length === 0) {
        return;
      }

      try {
        const results = await Promise.all(
          pendingModelIds.map(async (modelId) => {
            const response = await getAssetBrandInfoFromModelId(modelId);
            const root = response?.data;
            const payload = root?.data ?? root;
            const brandObj =
              payload?.rows?.[0] ||
              payload?.items?.[0] ||
              payload?.data?.[0] ||
              payload?.data ||
              payload;

            return {
              modelId,
              brand_id: brandObj?.brand_id,
              asset_brand: brandObj?.asset_brand || brandObj?.brand || brandObj?.brand_name || "",
            };
          })
        );

        setBrandInfoByModelId((prev) => {
          const next = { ...prev };
          results.forEach((row) => {
            next[String(row.modelId)] = row;
          });
          return next;
        });
      } catch {
      }
    };

    fetchBrandInfoByModel();
  }, [assetInfos, brandInfoByModelId]);

  const resolveBrandDisplay = (item) => {
    const modelBrand = brandInfoByModelId[String(item?.asset_model_id)];
    const mappedByReturnedBrandId = modelBrand?.brand_id
      ? brandNameById[String(modelBrand.brand_id)]
      : "";

    return (
      brandNameById[String(item?.brand_id || item?.asset_brand_id)] ||
      item?.brand ||
      item?.asset_brand ||
      mappedByReturnedBrandId ||
      modelBrand?.asset_brand ||
      item?.brand_id ||
      item?.asset_brand_id ||
      ""
    );
  };

  const [sortConfig, setSortConfig] = useState({
    key: "asset_serial_number",
    direction: "asc",
  });

  const filteredAssetInfo = assetInfos.filter((item) => {
    const searchValue = String(searchTerm || "").toLowerCase();

    const combinedValues = [
      familyNameById[String(item?.asset_family_id)],
      categoryNameById[String(item?.asset_category_id)],
      typeNameById[String(item?.asset_type_id)],
      resolveBrandDisplay(item),
      item?.asset_serial_number,
      item?.asset_purchase_date,
      item?.asset_price,
      item?.asset_warranty_expiry,
      item?.asset_extended_warranty,
      item?.asset_model,
      item?.model,
      modelNameById[String(item?.asset_model_id)],
    ]
      .map((value) => String(value || "").toLowerCase())
      .join(" ");

    return combinedValues.includes(searchValue);
  });

  const sortedAssetInfo = [...filteredAssetInfo].sort((a, b) => {
    const key = sortConfig.key;
    const direction = sortConfig.direction === "asc" ? 1 : -1;

    const resolveDisplayValue = (row) => {
      if (key === "asset_family") {
        return String(
          familyNameById[String(row?.asset_family_id)] ||
            row?.asset_family ||
            row?.family ||
            row?.asset_family_id ||
            ""
        ).toLowerCase();
      }

      if (key === "asset_category") {
        return String(
          categoryNameById[String(row?.asset_category_id)] ||
            row?.asset_category ||
            row?.category ||
            row?.asset_category_id ||
            ""
        ).toLowerCase();
      }

      if (key === "asset_type") {
        return String(
          typeNameById[String(row?.asset_type_id)] ||
            row?.asset_type ||
            row?.type ||
            row?.asset_type_id ||
            ""
        ).toLowerCase();
      }

      if (key === "asset_brand") {
        return String(
          resolveBrandDisplay(row)
        ).toLowerCase();
      }

      if (key === "asset_model") {
        return String(
          modelNameById[String(row?.asset_model_id)] ||
            row?.asset_model ||
            row?.model ||
            row?.asset_model_id ||
            ""
        ).toLowerCase();
      }

      return String(row?.[key] || "").toLowerCase();
    };

    const aValue = resolveDisplayValue(a);
    const bValue = resolveDisplayValue(b);

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
      "Asset Family":
        familyNameById[String(item.asset_family_id)] ||
        item.asset_family ||
        item.family ||
        item.asset_family_id ||
        "",
      "Asset Category":
        categoryNameById[String(item.asset_category_id)] ||
        item.asset_category ||
        item.category ||
        item.asset_category_id ||
        "",
      "Asset Type":
        typeNameById[String(item.asset_type_id)] ||
        item.asset_type ||
        item.type ||
        item.asset_type_id ||
        "",
      "Asset Brand":
        resolveBrandDisplay(item),
      "Asset Model":
        modelNameById[String(item.asset_model_id)] ||
        item.asset_model ||
        item.model ||
        item.asset_model_id ||
        "",
      "Asset Serial Number": item.asset_serial_number || "",
      "Asset Purchase Date": item.asset_purchase_date || "",
      "Asset Price": item.asset_price || "",
      "Asset Warranty Expiry": item.asset_warranty_expiry || "",
      "Extended Expiry Date": item.asset_extended_warranty || "",
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

        <div style={{ maxHeight: "400px", overflowY: "auto", overflowX: "auto" }}>
          <table
            className="table table-bordered table-hover text-center align-middle"
            style={{ whiteSpace: "nowrap" }}
          >
            <thead className="table-dark" style={{ position: "sticky", top: 0 }}>
              <tr>
                <th>Sr. No.</th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("asset_family")}> 
                  Asset Family{getSortArrow("asset_family")}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("asset_category")}> 
                  Asset Category{getSortArrow("asset_category")}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("asset_type")}> 
                  Asset Type{getSortArrow("asset_type")}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("asset_brand")}> 
                  Asset Brand{getSortArrow("asset_brand")}
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("asset_model")}> 
                  Asset Model{getSortArrow("asset_model")}
                </th>
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
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("asset_extended_warranty")}> 
                  Extended Expiry{getSortArrow("asset_extended_warranty")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={TOTAL_COLUMNS}>Loading...</td>
                </tr>
              ) : paginatedAssetInfo.length === 0 ? (
                <tr>
                  <td colSpan={TOTAL_COLUMNS}>No asset info found.</td>
                </tr>
              ) : (
                paginatedAssetInfo.map((item, index) => (
                  <tr key={item.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>
                      {familyNameById[String(item.asset_family_id)] ||
                        item.asset_family ||
                        item.family ||
                        item.asset_family_id}
                    </td>
                    <td>
                      {categoryNameById[String(item.asset_category_id)] ||
                        item.asset_category ||
                        item.category ||
                        item.asset_category_id}
                    </td>
                    <td>
                      {typeNameById[String(item.asset_type_id)] ||
                        item.asset_type ||
                        item.type ||
                        item.asset_type_id}
                    </td>
                    <td>
                      {resolveBrandDisplay(item)}
                    </td>
                    <td>
                      {modelNameById[String(item.asset_model_id)] ||
                        item.asset_model ||
                        item.model ||
                        item.asset_model_id}
                    </td>
                    <td>{item.asset_serial_number}</td>
                    {/* show purchase date in DD-MM-YYYY format */}
                    <td>{formatDate(item.asset_purchase_date)}</td>
                    <td>{item.asset_price}</td>
                    <td>{formatDate(item.asset_warranty_expiry)}</td>
                    <td>{formatDate(item.asset_extended_warranty)}</td>
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
  assetFamilies: PropTypes.array,
  assetCategories: PropTypes.array,
  assetTypes: PropTypes.array,
  assetBrands: PropTypes.array,
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