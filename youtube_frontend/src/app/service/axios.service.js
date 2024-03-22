import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { notify } from "../utilities/helpers";

export const http = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 30000,
  timeoutErrorMessage: "Server timed out",
  headers: {
    "content-type": "application/json",
  },
});

http.interceptors.response.use((response) => {
  if (response.status === StatusCodes.NOT_FOUND) {
    notify("API does not exists", "error");
  } else if (response.status === StatusCodes.UNAUTHORIZED) {
    notify("Unauthorized access", "error");
  } else if (response.status === StatusCodes.FORBIDDEN) {
    notify("Access denied", "error");
  } else if (response.status === StatusCodes.UNPROCESSABLE_ENTITY) {
    notify("Could not process the request", "error");
  }

  return response;
});
const getHeaders = (strict) => {
  let headers = {
    "content-type": "application/json",
  };
  if (strict) {
    let token = JSON.parse(localStorage.getItem("accessToken"));

    headers["headers"] = {
      authorization: "Bearer " + token,
    };
  }

  return headers;
};

export const httpPost = async (url, data, is_strict = false) => {
  try {
    let result = await http.post(url, data, getHeaders(is_strict));
    return result.data;
  } catch (error) {
    throw error;
  }
};

export const httpGet = async (url, params = null, is_strict = false) => {
  try {
    let headers = getHeaders(is_strict);
    if (params) {
      headers["params"] = params;
    }
    let result = await http.get(url, headers);
    return result.data;
  } catch (error) {
    console.log("Error Handler: ", error);
    throw error;
  }
};

export const httpPut = async (url, data, is_strict = false) => {
  try {
    let headers = getHeaders(is_strict);
    let result = await http.put(url, data, headers);
    return result.data;
  } catch (error) {
    return error;
  }
};

export const httpDelete = async (url, is_strict = false) => {
  try {
    let headers = getHeaders(is_strict);
    let result = await http.delete(url, headers);
    return result.data;
  } catch (error) {
    return error;
  }
};

// export const uploader = (url, method, data, field_name, file, is_strict = false) => {
//     return new Promise((res, rej) => {
//         let xmlhttp = new XMLHttpRequest();
//         let form_data = new FormData();

//         // file => [{name: ''}]
//         // blob
//         if(file){
//             if(Array.isArray(file)) {
//                 file.map((image) => {
//                     form_data.append(field_name, image, image.name);
//                 })
//             } else {
//                 form_data.append(field_name, file, file.name)
//                 delete data['image'];
//             }
//         }

//         // data => {title: '', link: '', status: ''}
//         Object.keys(data).map((key) => {
//             // array
//             form_data.append(key, data[key]);
//         })

//         xmlhttp.onreadystatechange = ((event) => {
//             if(xmlhttp.readyState === 4) {
//                res(xmlhttp.response ? JSON.parse(xmlhttp.response) : {});
//             }
//         })

//         xmlhttp.open(method, process.env.REACT_APP_API_URL+url);
//         if(is_strict){
//             let token = JSON.parse(localStorage.getItem("stack_7_token"));

//             xmlhttp.setRequestHeader('authorization', token)
//         }
//         xmlhttp.send(form_data);
//     })
// }
