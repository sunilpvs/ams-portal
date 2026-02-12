import { useEffect, useState, useRef, useCallback } from "react";
import AssignmentTypeForm from "./AssignmentTypesForm";
import AssignmentTypeTable from "./AssignmentTypesTable";
import Header from "../../../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import {
  addAssetAssignmentType,
  deleteAssetAssignmentType,
  editAssetAssignmentType,
  getPaginatedAssignmentTypes,
} from "../../../services/ams/assignmentTypeService";

const AssignmentTypes = () => {
  const [allAssignmentTypes, setAllAssignmentTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAssignmentType, setSelectedAssignmentType] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  /* ---------------- RESPONSE EXTRACTOR ---------------- */
  const extractAssignmentTypesResponse = (response) => {
    const payload = response?.data;
    const data = payload?.assignment_types ?? payload;

    const list =
      data?.data ??
      data?.assignment_types ??
      data?.items ??
      data?.rows ??
      (Array.isArray(data) ? data : []);

    const total =
      payload?.total ??
      payload?.count ??
      payload?.totalCount ??
      payload?.meta?.total ??
      payload?.pagination?.total ??
      (Array.isArray(list) ? list.length : 0);

    return { list, total };
  };

  /* ---------------- FETCH ---------------- */
  const fetchAssignmentTypes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPaginatedAssignmentTypes(
        page,
        limit,
        searchTerm
      );
      const { list, total } =
        extractAssignmentTypesResponse(response);

      setAllAssignmentTypes(list);
      setTotalCount(total);
    } catch (error) {
      setAllAssignmentTypes([]);
      setTotalCount(0);
      toast.error(
        error?.response?.data?.error ||
          "Failed to load assignment types"
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm]);

  useEffect(() => {
    fetchAssignmentTypes();
  }, [fetchAssignmentTypes]);

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await deleteAssetAssignmentType(id);
      toast.success("Assignment Type deleted successfully");

      if (allAssignmentTypes.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchAssignmentTypes();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to delete assignment type"
      );
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (formData) => {
    const payload = {
      assignment_type: formData.assignment_type,
    };

    try {
      if (editMode && formData.id) {
        await editAssetAssignmentType(formData.id, payload);
        toast.success("Assignment Type updated successfully");
      } else {
        await addAssetAssignmentType(payload);
        toast.success("Assignment Type added successfully");
      }

      setOpenForm(false);
      setSelectedAssignmentType(null);
      setEditMode(false);
      setPage(1); // reset to first page after add/edit
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Failed to save assignment type"
      );
    }
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (item) => {
    setSelectedAssignmentType({
      ...item,
      assignment_type:
        item.assignment_type ?? item.name ?? "",
    });
    setEditMode(true);
    setOpenForm(true);
  };

  /* ---------------- ADD ---------------- */
  const handleAdd = () => {
    setSelectedAssignmentType({ assignment_type: "" });
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
      const importedData = XLSX.utils.sheet_to_json(sheet);

      try {
        for (const item of importedData) {
          await addAssetAssignmentType({
            assignment_type:
              item.assignment_type ?? item.name ?? "",
          });
        }

        toast.success("Assignment Types imported successfully");
        setPage(1);
      } catch (error) {
        toast.error(
          error?.response?.data?.error ||
            "Failed to import assignment types"
        );
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

            <Header
              title="Assignment Type Management"
              subtitle="Admin / Assignment Types"
            />

            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={handleAdd}
              >
                + Add Assignment Type
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

          <AssignmentTypeTable
            assignmentTypes={allAssignmentTypes}
            totalCount={totalCount}
            deleteAssignmentType={handleDelete}
            editAssignmentType={handleEdit}
            currentPage={page}
            itemsPerPage={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onSearch={setSearchTerm}
            searchTerm={searchTerm}
            loading={loading}
          />

          {openForm && (
            <AssignmentTypeForm
              data={selectedAssignmentType}
              add={handleSubmit}
              close={() => {
                setOpenForm(false);
                setSelectedAssignmentType(null);
                setEditMode(false);
              }}
              editMode={editMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentTypes;
