import { useEffect, useState, useRef, useCallback } from "react";
import BrandsForm from "./BrandsForm";
import BrandsTable from "./BrandsTable";
import Header from "../../../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import {
  addAssetBrand,
  deleteAssetBrand,
  editAssetBrand,
  getPaginatedAssetBrands,
} from "../../../services/ams/assetBrandService";

const Brands = () => {
  const [allBrands, setAllBrands] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  /* ---------------- FETCH BRANDS ---------------- */
  const extractBrandsResponse = (response) => {
    const payload = response?.data;
    const data = payload?.asset_brands ?? payload;

    const list =
      data?.data ??
      data?.brands ??
      data?.items ??
      data?.rows ??
      (Array.isArray(data) ? data : []);

    const total =
      payload?.total ??
      payload?.count ??
      payload?.totalCount ??
      payload?.meta?.total ??
      payload?.pagination?.total ??
      data?.total ??
      data?.count ??
      data?.totalCount ??
      data?.meta?.total ??
      data?.pagination?.total ??
      (Array.isArray(list) ? list.length : 0);

    return { list, total };
  };

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPaginatedAssetBrands(page, limit);
      const { list, total } = extractBrandsResponse(response);
      setAllBrands(list);
      setTotalCount(total);
    } catch (error) {
      // console.error("Failed to fetch brands:", error);
      setAllBrands([]);
      setTotalCount(0);
      toast.error(error?.response?.data?.error || "Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await deleteAssetBrand(id);
      toast.success("Brand deleted successfully");

      if (allBrands.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchBrands();
      }
    } catch (error) {
      // console.error("Failed to delete brand:", error);
      toast.error(error?.response?.data?.error || "Failed to delete brand");
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (formData) => {
    const payload = {
      brand: formData.brand,
    };

    try {
      if (editMode && formData.id) {
        await editAssetBrand(formData.id, payload);
        toast.success("Brand updated successfully");
      } else {
        await addAssetBrand(payload);
        toast.success("Brand added successfully");
      }

      setOpenForm(false);
      setSelectedBrand(null);
      setEditMode(false);
      fetchBrands();
    } catch (error) {
      // console.error("Failed to save brand:", error);
      toast.error(error?.response?.data?.error || "Failed to save brand");
    }
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (brand) => {
    setSelectedBrand({
      ...brand,
      brand: brand.brand ?? brand.name ?? "",
    });
    setEditMode(true);
    setOpenForm(true);
  };

  /* ---------------- ADD ---------------- */
  const handleAdd = () => {
    setSelectedBrand({ brand: "" });
    setEditMode(false);
    setOpenForm(true);
  };

  /* ---------------- IMPORT ---------------- */
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const importedBrands = XLSX.utils.sheet_to_json(sheet);

      try {
        await Promise.all(
          importedBrands.map((item) =>
            addAssetBrand({
              brand: item.brand ?? item.name ?? "",
            })
          )
        );
        toast.success("Brands imported successfully");
        fetchBrands();
      } catch (error) {
        // console.error("Failed to import brands:", error);
        toast.error(error?.response?.data?.error || "Failed to import brands");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };



  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">

          {/* HEADER + ACTION BUTTONS */}
<div className="d-flex justify-content-between align-items-center mt-5 mb-3">

  {/* Left Side - Heading */}
  <Header title="Brand Management" subtitle="Admin / Brands" />

  {/* Right Side - Buttons */}
  <div className="d-flex gap-2">

    <button
      className="btn btn-primary"
      onClick={handleAdd}
    >
      + Add Brand
    </button>

    <button
      className="btn btn-info"
      onClick={handleImportClick}
    >
      Import
    </button>

    <input
      type="file"
      ref={fileInputRef}
      style={{ display: "none" }}
      accept=".xls,.xlsx,.csv"
      onChange={handleFileChange}
    />

  </div>

</div>

          <BrandsTable
            brands={allBrands}
            totalCount={totalCount}
            deleteBrand={handleDelete}
            editBrand={handleEdit}
            currentPage={page}
            itemsPerPage={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onSearch={setSearchTerm}
            searchTerm={searchTerm}
            loading={loading}
          />

          {openForm && (
            <BrandsForm
              data={selectedBrand}
              add={handleSubmit}
              close={() => setOpenForm(false)}
              editMode={editMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Brands;
