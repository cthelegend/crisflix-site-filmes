import { createAdminApi } from "../server/adminApi.js";
const api = createAdminApi();
export default (req, res) => api(req, res, true);
