import axios from "axios";

const BASE = "http://localhost:5000/api/drivers";

export const getDrivers = () => axios.get(BASE);
export const getDriver = (id) => axios.get(`${BASE}/${id}`);
export const addDriver = (data) => axios.post(BASE, data);
export const updateDriver = (id, data) => axios.put(`${BASE}/${id}`, data);
export const deleteDriver = (id) => axios.delete(`${BASE}/${id}`);
