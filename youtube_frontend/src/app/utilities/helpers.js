import { toast } from "react-hot-toast";

export const notify = (msg, status) => {
  if (status == "error") {
    toast.error(msg);
  } else {
    toast.success(msg);
  }
};

export const setLocalStore = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getLocalStorage = (key) => {
  return JSON.parse(localStorage.getItem(key)) ?? null;
};
