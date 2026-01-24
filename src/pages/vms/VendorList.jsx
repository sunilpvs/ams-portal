import { useState, useEffect } from 'react';
import VendorListTable from "./VendorListTable";

import { toast } from 'react-hot-toast';
import { getAllVendorsList } from '../../services/vms/vendorService';

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  // ... form states ...

  const fetchVendors = async (pageNum = page, limitPerPage = limit) => {
    try {
      const res = await getAllVendorsList(pageNum, limitPerPage);
      setVendors(res.data || []);      // fix here
      setTotal(res.data.total || 0);
      setPage(res.data.page || pageNum);
      setLimit(res.data.limit || limitPerPage);
    } catch (err) {
      console.error('Failed to fetch RFQs', err);
    }
  };

  useEffect(() => {
    fetchVendors(1, limit);
  }, [limit]);

  useEffect(() => {
    fetchVendors(page, limit);
  }, [page]);

  // ... handlers for add/edit/delete/search/pagination ...

  return (
    <div className="container mt-4">

      <VendorListTable
        vendors={vendors}
        total={total}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
        onRefresh={fetchVendors}
      />

    </div>
  );
};

export default VendorList;
