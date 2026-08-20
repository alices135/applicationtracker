/**
 * Paste this into Extensions > Apps Script for your spreadsheet, then
 * Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 * Copy the resulting URL into the tracker app's Sync settings.
 *
 * Writes into its own "App Tracker Sync" tab — your existing tabs are untouched.
 */

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = 'App Tracker Sync';
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.clearContents();

  var data = JSON.parse(e.postData.contents);
  var apps = data.apps || [];

  var headers = ['Company', 'Title', 'Location', 'Stage', 'Applied Date', 'Deadline', 'Tags', 'Notes', 'Links'];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

  apps.forEach(function (a) {
    sheet.appendRow([
      a.company || '',
      a.title || '',
      a.location || '',
      a.stage || '',
      a.appliedDate || '',
      a.deadline || '',
      (a.tags || []).join(', '),
      a.notes || '',
      (a.links || []).join(' | '),
    ]);
  });

  if (apps.length) {
    sheet.autoResizeColumns(1, headers.length);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, count: apps.length }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput('Tracker sync endpoint is live. POST JSON to this URL.');
}
