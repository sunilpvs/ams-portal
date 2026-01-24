import {
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAllVendorsList,
  getVendorRfqs,
} from "../../services/vms/vendorService";
import toast from "react-hot-toast";

function VendorRfqPage() {
  const { vendor_code } = useParams();
  const navigate = useNavigate();

  // ================= STATE =================
  const [vendors, setVendors] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(false);

  // table controls
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ================= LOAD VENDORS =================
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await getAllVendorsList(1, 100);
      setVendors(res.data || []);
    } catch (error) {
      console.error("Error loading vendors", error);
      toast.error("Failed to load vendors list");
    }
  };

  // ================= LOAD RFQS (URL IS SOURCE OF TRUTH) =================
  useEffect(() => {
    if (!vendor_code) {
      setRfqs([]);
      return;
    }

    fetchVendorRfqs(vendor_code);
  }, [vendor_code]);


  const fetchVendorRfqs = async (vendorCode) => {
    setLoading(true);
    try {
      const res = await getVendorRfqs(vendorCode);
      setRfqs(res.data?.["vendor-rfqs"] || []);
      console.log("Vendor RFQs:", res.data?.["vendor-rfqs"]);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error loading vendor RFQs", error);
      toast.error("Failed to load vendor RFQs");
      setRfqs([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE VENDOR CHANGE =================
  const handleVendorChange = (vendorCode) => {
    navigate(
      vendorCode
        ? `/vendor-rfqs/${encodeURIComponent(vendorCode)}`
        : "/vendor-rfqs"
    );
  };

  // ================= SEARCH =================
  const filteredRfqs = rfqs.filter((r) =>
    `${r.reference_id}
     ${r.full_registered_name} 
     ${r.vendor_name} 
     ${r.email} 
     ${r.mobile} 
     ${r.contact_person_name} 
     ${r.contact_person_mobile}
     ${r.expiry_date}
     ${r.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filteredRfqs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRfqs = filteredRfqs.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ================= RENDER =================
  return (
    <Box m="20px">
      <Header title="Vendor RFQs" subtitle="Vendor wise RFQ details" />

      {/* ================= Vendor Dropdown ================= */}
      <div className="mb-3">
        <label className="form-label text-dark fw-semibold">
          Vendor Code - Vendor Name
        </label>
        <select
          className="form-select"
          value={vendor_code || ""}
          onChange={(e) => handleVendorChange(e.target.value)}
        >
          <option value="">-- Select Vendor --</option>
          {vendors.map((vendor) => (
            <option
              key={vendor.vendor_code}
              value={vendor.vendor_code}
            >
              {vendor.vendor_code} - {vendor.full_registered_name}
            </option>
          ))}
        </select>
      </div>

      <div className="container mt-4 p-3 bg-white rounded shadow-sm">
        {/* ================= Search & Limit ================= */}
        <div className="d-flex justify-content-between mb-3">
          <input
            type="text"
            className="form-control w-50"
            placeholder="Search RFQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="form-select w-25"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* ================= RFQ TABLE ================= */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center">
            <thead className="table-dark">
              <tr>
                <th>Reference (RFQ) ID</th>
                <th>Vendor Name</th>
                <th>Vendor Email</th>
                <th>Vendor Mobile</th>
                <th>Contact Person Name</th>
                <th>Contact Person Mobile</th>
                <th>Status</th>
                <th>Expiry Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8">Loading...</td>
                </tr>
              ) : paginatedRfqs.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    {vendor_code
                      ? "No RFQs found for this vendor"
                      : "Please select a vendor"}
                  </td>
                </tr>
              ) : (
                paginatedRfqs.map((r) => (
                  <tr key={r.reference_id}>
                    <td>{r.reference_id}</td>
                    <td>{r.full_registered_name}</td>
                    <td>{r.email}</td>
                    <td>{r.mobile}</td>
                    <td>{r.contact_person_name}</td>
                    <td>{r.contact_person_mobile}</td>
                    <td>{r.status}</td>
                    <td>{r.expiry_date ? new Date(r.expiry_date).toLocaleDateString('en-GB') : "N/A"}</td>
                    <td>
                      {r.status_id === 7 ? (
                        <></>
                      ) : (
                        <Tooltip title="View Details">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => navigate(`/rfqs/${r.reference_id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {r.status_id === 8 || r.status_id === 9 ? (
                        <button
                          className="btn btn-sm btn-primary ms-3 mt-2"
                          onClick={() => navigate(`/review-vendor/${r.reference_id}`)}
                        >
                          Review
                        </button>
                      ) : r.status_id === 7 || r.status_id === 10 ? (
                        <span className="text-muted">Not Submitted</span>
                      ) : (
                        <div></div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= Pagination ================= */}
        {totalPages > 1 && (
          <div className="mt-3 text-end">
            <button
              className="btn btn-outline-secondary btn-sm me-1"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`btn btn-sm me-1 ${currentPage === i + 1
                  ? "btn-primary"
                  : "btn-outline-secondary"
                  }`}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Box>
  );
}

export default VendorRfqPage;
