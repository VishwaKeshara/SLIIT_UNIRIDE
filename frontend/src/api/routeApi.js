import axios from "../axiosinstance";

export const getRoutes = () => axios.get("/routes");
export const getActiveRoutes = () => axios.get("/routes/active");

