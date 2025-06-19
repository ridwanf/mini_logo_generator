/**
 * example get using array get(dto, "price.PAYMENT.0.TenderID", "")
 * example get(dto, "price.PAYMENT.status", "")
 */
export function get(obj, path, defaultValue) {
  if (!obj || typeof path !== "string") {
    return defaultValue;
  }
  const pathArray = path.split(".");
  let value = obj;
  for (var i = 0; i < pathArray.length; i++) {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    const key = isNaN(Number(pathArray[i]))
      ? pathArray[i]
      : Number(pathArray[i]);
    value = value[key];
  }
  return value !== undefined && value !== null ? value : defaultValue;
}

export function isEmpty(value) {
  if (value == null) {
    // Handles null and undefined values
    return true;
  }

  if (typeof value === "string" || Array.isArray(value)) {
    // Checks if the string or array is empty
    return value.length === 0;
  }

  if (typeof value === "object") {
    // Checks if the object has no own enumerable string keyed properties
    for (let key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        return false;
      }
    }
    return true;
  }

  return false;
}
