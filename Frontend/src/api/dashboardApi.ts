import { get } from "../lib/request";
import type { Dashboard } from "../types/dashboard";

export const dashboardApi = {
  getSummary: () => get<Dashboard>("/Dashboard"),
};
