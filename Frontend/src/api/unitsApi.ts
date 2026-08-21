import type { Unit } from "@/types/unit";
import { get, post, del, patch } from "../lib/request";

export const UnitsApi = {
  GetUnits: () => get<Unit[]>("/Units"),
  GetDeletedUnits: () => get<Unit[]>("/Units/Deleted"),
  CreateUnit: (name: string) => post<void>("/Units?Name=" + name),
  DeleteUnit: (id: number) => del<void>("/Units?id=" + id),
  EditUnit: (id: number, name: string) => patch<void>("/Units?id=" + id + "&Name=" + name),
  RestoreUnit: (id: number) => patch<void>("/Units/Restore?id=" + id),
};