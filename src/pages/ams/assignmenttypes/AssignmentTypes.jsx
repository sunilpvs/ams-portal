import { useCallback, useEffect, useRef, useState } from "react";
import AssignmentTypeForm from "./AssignmentTypesForm";
import AssignmentTypesTable from "./AssignmentTypesTable";
import Header from "../../../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";
import {
  addAssignmentType,
  deleteAssignmentType,
  editAssignmentType,
  getPaginatedAssignmentTypes,
} from "../../../services/ams/assignmentTypeService";

const AssignmentTypes = () => {
  const [allAssignmentTypes, setAllAssignmentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAssignmentType, setSelectedAssignmentType] = useState(null);

  const [importResult, setImportResult] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [duplicateRecords, setDuplicateRecords] = useState([]);

  const fileInputRef = useRef(null);

  const extractAssignmentTypesFromResponse = (response) => {
    const payload = response?.data?.assignment_types;

    // list of assignment types
    const list = (Array.isArray(payload) ? payload : []);

    // get total count from response, fallback to list length if not provided
    const total = response?.data?.total ?? (Array.isArray(list) ? list.length : 0);

    return {
      list: Array.isArray(list) ? list : [],
      total: Number.isFinite(Number(total)) ? Number(total) : 0,
    };
  };

  const fetchAssignmentTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPaginatedAssignmentTypes(currentPage, itemsPerPage);
      const { list, total } = extractAssignmentTypesFromResponse(response);

      setAllAssignmentTypes(list);
      setTotalCount(total);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch assignment types");
      setAllAssignmentTypes([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchAssignmentTypes();
  }, [fetchAssignmentTypes]);

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await deleteAssignmentType(id);
      toast.success("Deleted Successfully");

      if (allAssignmentTypes.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
        return;
      }

      fetchAssignmentTypes();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete assignment type");
    }
  };

  /* ---------------- ADD / EDIT ---------------- */
  const handleSubmit = async (formData) => {
    const payload = {
      assignment_type: (formData?.assignment_type || "").trim(),
    };

    if (!payload.assignment_type) {
      toast.error("Assignment type is required");
      return;
    }

    try {
      if (editMode && formData?.id) {
        await editAssignmentType(formData.id, payload);
        toast.success("Updated Successfully");
      } else {
        await addAssignmentType(payload);
        toast.success("Added Successfully");
      }

      setOpenForm(false);
      setEditMode(false);
      setSelectedAssignmentType(null);
      fetchAssignmentTypes();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to save assignment type");
    }
  };

  const handleEdit = (item) => {
    setSelectedAssignmentType(item);
    setEditMode(true);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setSelectedAssignmentType({ assignment_type: "" });
    setEditMode(false);
    setOpenForm(true);
  };

  /* ---------------- IMPORT (Dummy Same As Brands) ---------------- */
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = () => {
    const dummyImportResult = {
      total_rows: 12,
      inserted: 4,
      skipped_duplicate_db: 8,
    };

    const dummyDuplicates = [
      { id: 2, assignment_type: "Temporary" },
      { id: 3, assignment_type: "Contract" },
      { id: 4, assignment_type: "Contract" },
      { id: 5, assignment_type: "Contract" },
      { id: 6, assignment_type: "Contract" },
      { id: 7, assignment_type: "Contract" },
      { id: 8, assignment_type: "Contract" },
      { id: 9, assignment_type: "Contract" },
    ];

    setImportResult(dummyImportResult);
    setDuplicateRecords(dummyDuplicates);
    setShowImportModal(true);

    toast.success("Dummy Import Completed");
  };

  const handleUpdateDuplicates = () => {
    toast.success("Duplicate records updated (Frontend)");
    setShowImportModal(false);
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
            <Header
              title="Assignment Type Management"
              subtitle="Admin / Assignment Types"
            />

            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handleAdd}>
                + Add Assignment Type
              </button>

              <button className="btn btn-info" onClick={handleImportClick}>
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

          {/* TABLE */}
          <AssignmentTypesTable
            assignmentTypes={allAssignmentTypes}
            deleteAssignmentType={handleDelete}
            editAssignmentType={handleEdit}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onLimitChange={setItemsPerPage}
            onSearch={setSearchTerm}
            searchTerm={searchTerm}
            loading={loading}
            totalCount={totalCount}
          />

          {/* FORM */}
          {openForm && (
            <AssignmentTypeForm
              data={selectedAssignmentType}
              add={handleSubmit}
              close={() => setOpenForm(false)}
              editMode={editMode}
            />
          )}

          {/* IMPORT RESULT MODAL (Same Design as Brands) */}
          {showImportModal && importResult && (
            <div className="modal fade show d-block">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">

                  <div className="modal-header">
                    <h5 className="modal-title">Import Result</h5>
                    <button
                      className="btn-close"
                      onClick={() => setShowImportModal(false)}
                    ></button>
                  </div>

                  <div className="modal-body">
                    <p><strong>Total Rows:</strong> {importResult.total_rows}</p>
                    <p><strong>Inserted:</strong> {importResult.inserted}</p>
                    <p><strong>Duplicate in DB:</strong> {importResult.skipped_duplicate_db}</p>

                    {duplicateRecords.length > 0 && (
                      <>
                        <h6 className="text-danger mt-3">
                          Duplicate Records Found
                        </h6>

                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                          <table className="table table-bordered table-striped">
                            <thead
                              className="table-light"
                              style={{ position: "sticky", top: 0, zIndex: 1 }}
                            >
                              <tr>
                                <th>S.No</th>
                                <th>ID</th>
                                <th>Assignment Type</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {duplicateRecords.map((row, index) => (
                                <tr key={row.id}>
                                  <td>{index + 1}</td>
                                  <td>{row.id}</td>
                                  <td>{row.assignment_type}</td>
                                  <td>
                                    <span className="text-danger fw-bold">
                                      Duplicate
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-success"
                      onClick={handleUpdateDuplicates}
                    >
                      Update
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowImportModal(false)}
                    >
                      Close
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AssignmentTypes;
