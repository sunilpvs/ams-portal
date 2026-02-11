import { useEffect, useState, useRef } from "react";
import BrandsForm from "./BrandsForm";
import BrandsTable from "./BrandsTable";
import Header from "../../../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";

const Brands = () => {
  const [allBrands, setAllBrands] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const fileInputRef = useRef(null);

  /* ---------------- FETCH BRANDS ---------------- */
  useEffect(() => {
    // Temporary static data (since no service)
    setAllBrands([
      { id: 1, name: "Nike" },
      { id: 2, name: "Adidas" },
      { id: 3, name: "Puma" },
    ]);
  }, []);

  /* ---------------- DELETE ---------------- */
  const handleDelete = (id) => {
    setAllBrands((prev) => prev.filter((brand) => brand.id !== id));
    toast.success("Brand deleted successfully");
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = (formData) => {
    if (editMode) {
      setAllBrands((prev) =>
        prev.map((brand) =>
          brand.id === formData.id ? formData : brand
        )
      );
      toast.success("Brand updated successfully");
    } else {
      const newBrand = {
        ...formData,
        id: Date.now(),
      };
      setAllBrands((prev) => [...prev, newBrand]);
      toast.success("Brand added successfully");
    }

    setOpenForm(false);
    setSelectedBrand(null);
    setEditMode(false);
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setEditMode(true);
    setOpenForm(true);
  };

  /* ---------------- ADD ---------------- */
  const handleAdd = () => {
    setSelectedBrand({ name: "" });
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
  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const importedBrands = XLSX.utils.sheet_to_json(sheet).map((b, i) => ({
      id: Date.now() + i, // unique id
      ...b,
    }));

    const updatedBrands = [...allBrands, ...importedBrands];
    setAllBrands(updatedBrands);
    localStorage.setItem("brands", JSON.stringify(updatedBrands)); // persist

    toast.success("Brands imported successfully");

    e.target.value = ""; // reset file input
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
            deleteBrand={handleDelete}
            editBrand={handleEdit}
            currentPage={page}
            itemsPerPage={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onSearch={setSearchTerm}
            searchTerm={searchTerm}
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
