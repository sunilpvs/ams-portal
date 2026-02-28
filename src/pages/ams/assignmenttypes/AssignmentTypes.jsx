import { useEffect, useState, useRef } from "react";
import AssignmentTypeForm from "./AssignmentTypesForm";
import AssignmentTypesTable from "./AssignmentTypesTable";
import Header from "../../../components/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";

const AssignmentTypes = () => {
  const [allAssignmentTypes, setAllAssignmentTypes] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAssignmentType, setSelectedAssignmentType] = useState(null);

  const [importResult, setImportResult] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [duplicateRecords, setDuplicateRecords] = useState([]);

  const fileInputRef = useRef(null);

  /* ---------------- DUMMY DATA ---------------- */
  useEffect(() => {
    const dummyData = [
      { id: 1, assignment_type: "Permanent" },
      { id: 2, assignment_type: "Temporary" },
      { id: 3, assignment_type: "Contract" },
      { id: 4, assignment_type: "Internship" },
      { id: 5, assignment_type: "Remote" },
    ];
    setAllAssignmentTypes(dummyData);
  }, []);

  /* ---------------- DELETE ---------------- */
  const handleDelete = (id) => {
    setAllAssignmentTypes((prev) =>
      prev.filter((item) => item.id !== id)
    );
    toast.success("Deleted Successfully");
  };

  /* ---------------- ADD / EDIT ---------------- */
  const handleSubmit = (formData) => {
    if (editMode) {
      setAllAssignmentTypes((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? { ...item, assignment_type: formData.assignment_type }
            : item
        )
      );
      toast.success("Updated Successfully");
    } else {
      setAllAssignmentTypes((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          assignment_type: formData.assignment_type,
        },
      ]);
      toast.success("Added Successfully");
    }

    setOpenForm(false);
    setEditMode(false);
    setSelectedAssignmentType(null);
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
            currentPage={1}
            itemsPerPage={10}
            onPageChange={() => {}}
            onLimitChange={() => {}}
            onSearch={() => {}}
            searchTerm=""
            loading={false}
            totalCount={allAssignmentTypes.length}
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
