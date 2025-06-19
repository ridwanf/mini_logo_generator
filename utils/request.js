import { get, isEmpty } from "./general";
import { getBearerToken } from "./globalData";

/**
 * Perform an asynchronous HTTP request using the Alipay (my) API.
 *
 * @param {Object} options - The options object for the request.
 * @param {string} options.url - The URL for the HTTP request.
 * @param {"GET" | "POST"} options.method - The HTTP method (e.g., 'GET', 'POST').
 * @param {Object} [options.params={}] - The params to be added to the url request (default is an empty object).
 * @param {Object} [options.data={}] - The data to be sent with the request (default is an empty object).
 * @param {Object} [options.headers={}] - The headers to be included in the request (default is an empty object).
 * @param {number} options.timeout - The timeout for the request in milliseconds.
 * @returns {Promise} A Promise that resolves with the result if the request is successful, and rejects with an error if the request fails.
 *
 * @example
 * const requestOptions = {
 *   url: 'https://api.example.com/resource',
 *   method: 'GET',
 *   params: { page_num: 1, page_size: 5}
 *   data: { id: 'testID' },
 *   headers: { Authorization: 'Bearer TOKEN' },
 *   timeout: 5000,
 * };
 *
 * try {
 *  const result = await request(requestOptions)
 *  // handle success response
 * } catch {
 *  // handle error
 * }
 */
export const request = ({ url, method, params, data, headers, timeout }) =>
  new Promise((resolve, reject) => {
    try {
      const requestHeaders = isEmpty(headers)
        ? {
            Authorization: getBearerToken()
          }
        : headers;

      const requestUrl = addParamsToUrl(url, params);

      my.request({
        url: requestUrl,
        method,
        ...(requestHeaders ? { headers: requestHeaders } : {}),
        ...(data ? { data } : {}),
        ...(timeout ? { timeout } : {}),
        success: result => {
          if (result.status === 200) {
            resolve(result);
          } else {
            reject(result);
          }
        },
        fail: error => {
          try {
            let parsedErrorData = get(error, "data", {});

            // // Need to parse error.data in release version because
            // // Alipay stringify the object error.data in error response for release version
            try {
              parsedErrorData = JSON.parse(get(error, "data", ""));
            } catch (e) {}

            const parsedError = {
              ...error,
              data: parsedErrorData
            };

            // const errorStatus = get(parsedError, "status", undefined);
            // // if (errorStatus === ERROR_UNAUTHORIZED) {
            // //   my.reLaunch({
            // //     url: route.SESSION_EXPIRED
            // //   });
            // // }

            reject(parsedError);
          } catch (error) {
            reject(error);
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  });

export function addParamsToUrl(url, params) {
  if (isEmpty(params)) {
    return url;
  }

  // Create an array to store key-value pairs of parameters
  const queryParams = [];

  // Iterate over the object properties
  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      // Encode each key and value, and push them to the array
      queryParams.push(
        encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
      );
    }
  }

  // Join the array with '&' to create the final query string
  const queryString = queryParams.join("&");

  // Check if the URL already has parameters
  const separator = url.includes("?") ? "&" : "?";

  // Concatenate the URL and the query string
  const finalUrl = url + separator + queryString;

  return finalUrl;
}

export const debounce = (callback, params, delay, init) => { 
  let timerId;

  if (timerId) {
    clearTimeout(timerId);
  }
  timerId = setTimeout(()=>{
     callback(params, init);
  }, delay)
};