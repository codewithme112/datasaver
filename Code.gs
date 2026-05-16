// ============================================================
//  Sai Autotech — Google Apps Script (Complete)
//  Sheets: Lead1 | Work1 | Booking1
// ============================================================

// ──────────────────────────────────────────────────────────────
//  doPost — Data save karna
// ──────────────────────────────────────────────────────────────
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const leadSheet    = ss.getSheetByName("Lead1");
  const workSheet    = ss.getSheetByName("Work1");
  const bookingSheet = ss.getSheetByName("Booking1");

  const timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "dd-MM-yyyy HH:mm:ss"
  );

  // ── CustomerLeadForm ──────────────────────────────────────
  if (data.type === "lead") {
    leadSheet.appendRow([
      data.tokenNumber    || '',
      data.name           || '',
      data.vehicleNumber  || '',
      data.contactNumber  || '',
      data.companyName    || '',
      data.totalVehicle   || '',
      data.ownerManager   || '',
      data.officeLocation || '',
      data.upcomingWork   || '',
      timestamp
    ]);
  }

  // ── WorkDetailsForm ───────────────────────────────────────
  if (data.type === "work") {
    workSheet.appendRow([
      data.vehicleNumber || '',
      data.workDone      || '',
      data.partsCost     || '',
      data.labourCost    || '',
      data.totalBill     || '',
      data.remarks       || '',
      timestamp
    ]);
  }

  // ── AdvanceBookingForm ────────────────────────────────────
  if (data.type === "booking") {
    bookingSheet.appendRow([
      data.customerName  || '',
      data.contactNumber || '',
      data.vehicleNumber || '',
      data.serviceType   || '',
      data.preferredDate || '',
      data.preferredTime || '',
      data.notes         || '',
      data.companyName   || '',
      timestamp
    ]);
  }

  return ContentService.createTextOutput("Success");
}

// ──────────────────────────────────────────────────────────────
//  doGet — Data fetch karna
// ──────────────────────────────────────────────────────────────
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const leadSheet    = ss.getSheetByName("Lead1");
  const workSheet    = ss.getSheetByName("Work1");
  const bookingSheet = ss.getSheetByName("Booking1");

  const type = e.parameter.type;
  let data = [];

  // ── Leads ─────────────────────────────────────────────────
  if (type === "lead") {
    const rows = leadSheet.getDataRange().getValues();
    if (rows.length > 1) {
      const headers = rows[0];
      data = rows.slice(1).map(row => {
        const entry = {};
        headers.forEach((header, i) => entry[header] = row[i]);
        return entry;
      });
    }
  }

  // ── Works ─────────────────────────────────────────────────
  if (type === "work") {
    const rows = workSheet.getDataRange().getValues();
    if (rows.length > 1) {
      const headers = rows[0];
      data = rows.slice(1).map(row => {
        const entry = {};
        headers.forEach((header, i) => entry[header] = row[i]);
        return entry;
      });
    }
  }

  // ── Bookings ──────────────────────────────────────────────
  if (type === "booking") {
    const rows = bookingSheet.getDataRange().getValues();
    if (rows.length > 1) {
      const headers = rows[0];
      data = rows.slice(1).map(row => {
        const entry = {};
        headers.forEach((header, i) => entry[header] = row[i]);
        return entry;
      });
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
