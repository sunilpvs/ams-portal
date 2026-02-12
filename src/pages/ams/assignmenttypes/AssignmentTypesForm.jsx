import { useState, useEffect } from "react";

const AssignmentTypeForm = ({ data, add, close, editMode }) => {
  const [formData, setFormData] = useState({
    ...data,
    assignment_type:
      data?.assignment_type ?? data?.name ?? "",
  });

  useEffect(() => {
    setFormData({
      ...data,
      assignment_type:
        data?.assignment_type ?? data?.name ?? "",
    });
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      assignment_type: (formData.assignment_type || "").trim(),
    };

    if (formData.id) {
      payload.id = formData.id;
    }

    add(payload);
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ marginLeft: "auto", marginRight: "30%" }}
      >
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">
                {editMode
                  ? "Edit Assignment Type"
                  : "Add Assignment Type"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={close}
              ></button>
            </div>

            <div className="modal-body">
              <input
                type="text"
                name="assignment_type"
                value={formData.assignment_type || ""}
                onChange={handleChange}
                placeholder="Assignment Type Name"
                className="form-control mb-3"
                required
              />
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn btn-success">
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={close}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignmentTypeForm;
