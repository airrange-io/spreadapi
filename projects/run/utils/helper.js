import is from "is";

function toBase26Ish(c) {
  return c.charCodeAt(0) - 65 + 1;
}

export function getSheetNameFromAddress(address) {
  if (!address) return "";
  const idx = is.string(address) ? address.indexOf("!") : -1;
  let sheetName = idx > -1 ? address.substring(0, idx) : "";
  if (sheetName.includes(" ") && !sheetName.includes("'")) {
    sheetName = "'" + sheetName + "'";
  }
  return sheetName;
}

function getLocalCellNameFromAddressNoDollar(address) {
  if (!address) return "";
  const idx = address.indexOf("!");
  return (idx > -1 ? address.substring(idx + 1) : "").replaceAll("$", "");
}

export function getIsSingleCellFromAddress(address) {
  if (!address) return false;
  const idx = address.indexOf("!");
  const cellAddress = idx > -1 ? address.substring(idx + 1) : "";
  const sepIdx = cellAddress.indexOf(":");
  if (sepIdx === -1) return true;
  return cellAddress.substring(0, sepIdx) === cellAddress.substring(sepIdx + 1);
}

export function getCartesianCoords(excelCoords, offset) {
  if (!excelCoords) return { row: 0, col: 0 };
  let address = excelCoords.includes("!") ? getLocalCellNameFromAddressNoDollar(excelCoords) : excelCoords;
  let coords = address.toUpperCase();
  var row = parseInt(coords.replace(/^[A-Z]+/, ""));
  var colChars = coords.replace(/\d+$/, "").split("").reverse();
  var col = 0, multiplier = 1;
  while (colChars.length) {
    col += toBase26Ish(colChars.shift()) * multiplier;
    multiplier *= 26;
  }
  if (offset) { col = col - offset.col - 1; row = row - offset.row - 1; }
  return { row, col };
}

export function getRangeAsOffset(address) {
  if (!address) return;
  try {
    const idx = address.indexOf("!");
    let sheetName = idx > -1 ? address.substring(0, idx) : "";
    let offsetAddress = address.replace(sheetName + "!", "").replaceAll("'", "").replaceAll("$", "");

    let sepIdx = offsetAddress.indexOf(":");
    const offsetFromString = offsetAddress.substring(0, sepIdx);
    const offsetToString = offsetAddress.substring(sepIdx + 1);
    if (offsetFromString === offsetToString) sepIdx = -1;

    sheetName = sheetName.replaceAll("'", "");

    if (sepIdx !== -1) {
      let offsetFrom = getCartesianCoords(offsetFromString);
      offsetFrom.col--; offsetFrom.row--;
      let offsetTo = getCartesianCoords(offsetToString);
      offsetTo.col--; offsetTo.row--;
      return { sheetName, type: "range", rowFrom: offsetFrom.row, colFrom: offsetFrom.col, rowTo: offsetTo.row, colTo: offsetTo.col };
    } else {
      let offset = getCartesianCoords(offsetToString);
      offset.col--; offset.row--;
      return { sheetName, type: "cell", row: offset.row, col: offset.col };
    }
  } catch (error) {
    console.log("ERROR getRangeAsOffset", error, address);
  }
}

export function getError(info) {
  return { error: info };
}

export function getDateForCallsLog() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}
