import { get, post } from "../lib/request";

export const ShiftApi = {
  GetStatus: () => get<boolean>("/Shifts/Status"),
  OpenShift: (OpeningCash: number) => post<void>("/Shifts/OpenShift", OpeningCash),
  CloseShift: (ClosingCash: number) => post<void>("/Shifts/CloseShift", ClosingCash),
};