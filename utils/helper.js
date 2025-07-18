import is from "is";

function toBase26Ish(c) {
  const CAPITAL_A = 65;
  return c.charCodeAt(0) - CAPITAL_A + 1;
}

export function sanitizeRedisKey(key) {
  // Basic sanitization for Redis keys
  return String(key).replace(/[^a-zA-Z0-9_:.-]/g, "_");
}

export function getSheetNameFromAddress(address) {
  if (!address) {
    return "";
  }
  const sheetNameSeparatorIndex = is.string(address)
    ? address.indexOf("!")
    : -1;
  let sheetName =
    sheetNameSeparatorIndex > -1
      ? address.substring(0, sheetNameSeparatorIndex)
      : "";
  // add surroundings if needed
  if (sheetName.includes(" ") && !sheetName.includes("'")) {
    sheetName = "'" + sheetName + "'";
  }
  return sheetName;
}

export function getLocalCellNameFromAddressNoDollar(address) {
  return getLocalCellNameFromAddress(address).replaceAll("$", "");
}

export function getLocalCellNameFromAddress(address) {
  if (!address) return "";

  const sheetNameSeparatorIndex = address.indexOf("!");
  const cellAddress =
    sheetNameSeparatorIndex > -1
      ? address.substring(sheetNameSeparatorIndex + 1)
      : "";
  return cellAddress;
}

export function getIsSingleCellFromAddress(address) {
  if (!address) {
    return false;
  }
  const sheetNameSeparatorIndex = address.indexOf("!");
  const cellAddress =
    sheetNameSeparatorIndex > -1
      ? address.substring(sheetNameSeparatorIndex + 1)
      : "";
  const cellSeparatorIndex = cellAddress.indexOf(":");
  if (cellSeparatorIndex === -1) {
    return true;
  }

  const leftCell = cellAddress.substring(0, cellSeparatorIndex);
  const rightCell = cellAddress.substring(cellSeparatorIndex + 1);
  return leftCell === rightCell;
}

export function getCartesianCoords(excelCoords, offset) {
  if (!excelCoords) return { row: 0, col: 0 };
  let address = excelCoords;
  if (excelCoords.includes("!")) {
    address = getLocalCellNameFromAddressNoDollar(excelCoords);
  }
  let coords = address.toUpperCase();
  var row = parseInt(coords.replace(/^[A-Z]+/, ""));
  var colChars = coords.replace(/\d+$/, "").split("").reverse();
  var col = 0;
  var multiplier = 1;
  while (colChars.length) {
    col += toBase26Ish(colChars.shift()) * multiplier;
    multiplier *= 26;
  }
  if (offset) {
    col = col - offset.col - 1;
    row = row - offset.row - 1;
  }
  return { row, col };
}

export function getRangeAsOffset(address) {
  if (!address) return;

  try {
    const sheetNameSeparatorIndex = address.indexOf("!");
    let sheetName =
      sheetNameSeparatorIndex > -1
        ? address.substring(0, sheetNameSeparatorIndex)
        : "";
    // calculate offset
    let offsetAddress = address
      .replace(sheetName + "!", "")
      .replaceAll("'", "")
      .replaceAll("$", "");

    let separatorIndex = offsetAddress.indexOf(":");

    const offsetFromString = offsetAddress.substring(0, separatorIndex);
    const offsetToString = offsetAddress.substring(separatorIndex + 1);
    if (offsetFromString === offsetToString) separatorIndex = -1;

    let type = separatorIndex === -1 ? "cell" : "range";
    sheetName = sheetName.replaceAll("'", "");

    if (type === "range") {
      let offsetFrom = getCartesianCoords(offsetFromString);
      offsetFrom.col = offsetFrom.col - 1;
      offsetFrom.row = offsetFrom.row - 1;
      let offsetTo = getCartesianCoords(offsetToString);
      offsetTo.col = offsetTo.col - 1;
      offsetTo.row = offsetTo.row - 1;
      return {
        sheetName: sheetName,
        sheetIndex: -1,
        type: type,
        rowFrom: offsetFrom.row,
        colFrom: offsetFrom.col,
        rowTo: offsetTo.row,
        colTo: offsetTo.col,
      };
    } else {
      let offset = getCartesianCoords(offsetToString);
      offset.col = offset.col - 1;
      offset.row = offset.row - 1;
      return {
        sheetName: sheetName,
        sheetIndex: -1,
        type: type,
        row: offset.row,
        col: offset.col,
      };
    }
  } catch (error) {
    console.log("ERROR getRangeAsOffset", error, address);
  }
}

export function getDateForCallsLog() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export function isNumber(str) {
  if (is.number(str)) return true;
  if (typeof str != "string") return false; // we only process strings!
  // could also coerce to string: str = ""+str
  return !isNaN(str) && !isNaN(parseFloat(str));
}

export function trimString(str) {
  if (!str) return "";
  return str.trim().replaceAll(" ", "_");
}

export function getError(info) {
  return { error: info };
}
