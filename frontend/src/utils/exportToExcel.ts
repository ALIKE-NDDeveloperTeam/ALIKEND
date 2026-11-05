import * as XLSX from 'xlsx';

/**
 * Universal SheetJS Excel Export Utility for ALIKE ND Administrator Console
 */

export const exportDataToExcel = (
  data: Record<string, any>[],
  filename: string,
  sheetName: string = 'Sheet1'
) => {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-calculate column widths based on maximum cell string length
  const colKeys = Object.keys(data[0] || {});
  const colWidths = colKeys.map((key) => {
    let maxLen = key.length;
    for (const row of data) {
      const val = row[key];
      const strVal = val !== undefined && val !== null ? String(val) : '';
      if (strVal.length > maxLen) {
        maxLen = strVal.length;
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 12), 50) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const todayStr = new Date().toISOString().split('T')[0];
  const cleanFilename = filename.endsWith('.xlsx')
    ? filename
    : `${filename}_${todayStr}.xlsx`;

  XLSX.writeFile(workbook, cleanFilename);
};

export const exportMultiSheetToExcel = (
  sheets: { sheetName: string; data: Record<string, any>[] }[],
  filename: string
) => {
  if (!sheets || sheets.length === 0) {
    alert('No data available to export.');
    return;
  }

  const workbook = XLSX.utils.book_new();
  let addedSheets = 0;

  for (const { sheetName, data } of sheets) {
    if (!data || data.length === 0) continue;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const colKeys = Object.keys(data[0] || {});
    worksheet['!cols'] = colKeys.map((key) => {
      let maxLen = key.length;
      for (const row of data) {
        const val = row[key];
        const strVal = val !== undefined && val !== null ? String(val) : '';
        if (strVal.length > maxLen) maxLen = strVal.length;
      }
      return { wch: Math.min(Math.max(maxLen + 3, 12), 50) };
    });
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    addedSheets++;
  }

  if (addedSheets === 0) {
    alert('No report data available to export.');
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const cleanFilename = filename.endsWith('.xlsx')
    ? filename
    : `${filename}_${todayStr}.xlsx`;

  XLSX.writeFile(workbook, cleanFilename);
};

// Specialized data row formatters for clean, readable headers

export const formatOrdersForExcel = (orders: any[]): Record<string, any>[] => {
  return orders.map((o) => ({
    'Order #': o.orderNumber || o._id || 'N/A',
    'Member Name': o.memberName || 'Guest Buyer',
    'Member Email': o.memberEmail || 'N/A',
    'Total Amount': `₹${Number(o.total || 0).toLocaleString('en-IN')}`,
    'Status': (o.status || 'pending').toUpperCase(),
    'Date': o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : 'N/A',
  }));
};

export const formatSellersForExcel = (sellers: any[]): Record<string, any>[] => {
  return sellers.map((s) => ({
    'Shop Name': s.shopName || s.storefront || 'Atelier',
    'Storefront Slug': s.storefront || 'N/A',
    'Owner Name': s.ownerName || 'N/A',
    'Owner Email': s.ownerEmail || s.email || 'N/A',
    'Phone': s.mobileNumber || 'N/A',
    'Business Address': s.businessAddress || 'N/A',
    'PAN Number': s.panNumber || 'N/A',
    'GSTIN': s.gstin || 'N/A',
    'KYC Status': s.kycVerified ? 'VERIFIED' : 'PENDING',
    'Active Catalog Listings': Number(s.listingsCount || 0),
    'Storefront Status': (s.status || 'pending').toUpperCase(),
    'Registered Date': s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : 'N/A',
  }));
};

export const formatCustomersForExcel = (customers: any[]): Record<string, any>[] => {
  return customers.map((c) => ({
    'Customer Name': c.name || 'Valued Member',
    'Email Address': c.email || 'N/A',
    'Contact Phone': c.phone || c.mobileNumber || 'N/A',
    'Country / Region': c.country || 'India',
    'Loyalty Tier': c.tier || 'Silver',
    'Account Status': c.isBlocked ? 'BLOCKED' : 'ACTIVE',
    'Total Orders Placed': Number(c.ordersCount || 0),
    'Lifetime Spend (₹)': Number(c.lifetimeSpend || 0),
    'Member Since': c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : 'N/A',
  }));
};

export const formatProductsForExcel = (products: any[]): Record<string, any>[] => {
  return products.map((p) => ({
    'Product Title': p.name || 'Luxury Creation',
    'Brand / Atelier': p.brand || 'ALIKE ND Signature',
    'Category': p.category || 'General',
    'Sub-Category': p.subCategory || 'Standard',
    'Price (₹)': Number(p.price || 0),
    'MRP (₹)': Number(p.mrp || p.price || 0),
    'Inventory Stock': Number(p.stock || 0),
    'Stock Status': p.stockStatus || (p.stock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK'),
    'Rating (⭐)': Number(p.rating || 5.0),
    'Customer Reviews Count': Number(p.reviewsCount || 0),
    'Merchandising Badge': p.badge || 'Standard',
    'Flash Sale Item': p.isFlashSale ? 'YES' : 'NO',
    'Wholesale Available': p.isWholesale ? 'YES' : 'NO',
    'Wholesale Min Qty': p.wholesaleMinQty ? Number(p.wholesaleMinQty) : 'N/A',
    'Wholesale Price (₹)': p.wholesalePrice ? Number(p.wholesalePrice) : 'N/A',
    'Seller Shop Name': p.sellerShopName || 'Atelier Official',
    'HSN Code': p.hsnCode || 'N/A',
    'GST Rate': p.gstRate ? `${p.gstRate}%` : '18%',
    'Origin Country': p.countryOfOrigin || 'India',
  }));
};

export const formatCommissionForExcel = (orders: any[]): Record<string, any>[] => {
  return orders.map((ord) => ({
    'Order #': ord.orderNumber || ord._id,
    'Date': ord.date ? new Date(ord.date).toLocaleDateString('en-IN') : 'N/A',
    'Customer Name': ord.memberName || 'Valued Member',
    'Customer Email': ord.memberEmail || 'N/A',
    'Customer Paid Total (₹)': Number(ord.total || 0),
    'Platform Fee Rate': `${ord.commissionRate || 5}%`,
    'Platform Commission (₹)': Number(ord.commissionAmount || 0),
    'Seller Payout Balance (₹)': Number(ord.sellerPayout || 0),
    'Payment Method': (ord.paymentMethod || 'CARD').toUpperCase(),
    'Order Status': (ord.status || 'processing').toUpperCase(),
    'Platform Credit Status': (ord.commissionStatus || 'CREDITED').toUpperCase(),
  }));
};

export const formatActivityLogsForExcel = (logs: any[]): Record<string, any>[] => {
  return logs.map((log) => ({
    'Event Type': log.eventType,
    'User Name': log.userName || 'Unknown User',
    'Email Address': log.email || 'N/A',
    'Event Status': (log.status || 'success').toUpperCase(),
    'IP Address': log.ipAddress || 'N/A',
    'Device / OS': log.deviceInfo || 'N/A',
    'Browser': log.browser || 'N/A',
    'Operating System': log.os || 'N/A',
    'Details': log.details || 'N/A',
    'Timestamp': log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : 'N/A',
  }));
};

export const formatBannersForExcel = (banners: any[]): Record<string, any>[] => {
  return banners.map((b) => ({
    'Banner Order': b.order,
    'Title': b.title || 'Untitled Banner',
    'Subtitle': b.subtitle || 'N/A',
    'Button CTA': b.buttonText || 'Explore',
    'Target Link': b.link || '/',
    'Status': b.active ? 'ACTIVE' : 'INACTIVE',
    'Image Source': b.imageUrl,
    'Created At': b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : 'N/A',
  }));
};

export const formatAdminUsersForExcel = (admins: any[]): Record<string, any>[] => {
  return admins.map((adm) => ({
    'Administrator Name': adm.name || 'Admin',
    'Admin Email': adm.email,
    'Role Permission': (adm.role || 'admin').toUpperCase(),
    'Account Status': adm.isActive !== false ? 'ACTIVE' : 'SUSPENDED',
    'Created Date': adm.createdAt ? new Date(adm.createdAt).toLocaleDateString('en-IN') : 'N/A',
  }));
};
