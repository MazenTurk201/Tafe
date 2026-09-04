import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/animate-ui/components/radix/dialog";
import { useTranslation } from "react-i18next";
import { SuppliersApi } from "@/api/suppliersApi";
import type { Supplier } from "@/types/supplier";

interface AddSupplierDialogProps {
  onSuccess: () => void;
}

export function AddSupplierDialog({ onSuccess }: AddSupplierDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async () => {

    if (!name.trim()) {
      return;
    }

    try {
      setLoading(true);
      await SuppliersApi.CreateSupplier({ name, phone, email, address });
      onSuccess();
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className="
            rounded-xl bg-black px-5 py-3
            text-sm font-semibold text-white
            hover:bg-zinc-500
            dark:bg-white dark:text-black cursor-pointer
          "
        >
          {t("SupplierCreate")}
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("Suppliers")}
          </DialogTitle>

          <DialogDescription>
            {t("SupplierAddDes")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="mb-2 block">
            {t("SupplierName")}
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("SupplierPlaceholderName")}
            className="w-full rounded-md border px-3 py-2"
          />

          <label className="mb-2 block mt-3">
            {t("phone")}
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("SupplierPlaceholderPhone")}
            className="w-full rounded-md border px-3 py-2"
          />

          <label className="mb-2 block mt-3">
            {t("email")}
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("SupplierPlaceholderEmail")}
            className="w-full rounded-md border px-3 py-2"
          />

          <label className="mb-2 block mt-3">
            {t("address")}
          </label>

          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t("SupplierPlaceholderAddress")}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !name}
          >
            {loading
              ? t("loading")
              : t("create")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


interface UpdateSupplierDialogProps {
  model: Supplier;
  onSuccess: () => void;
}

export function UpdateSupplierDialog({
  model,
  onSuccess,
}: UpdateSupplierDialogProps) {
  const [name, setName] = useState(model.name);
  const [phone, setPhone] = useState(model.phone ?? "");
  const [email, setEmail] = useState(model.email ?? "");
  const [address, setAddress] = useState(model.address ?? "");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async () => {

    if (!name.trim()) {
      return;
    }

    try {
      setLoading(true);
      await SuppliersApi.EditSupplier({ id: model.id, name, phone, email, address });
      onSuccess();
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="update-btn">
          {t("update")}
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("Suppliers")}
          </DialogTitle>

          <DialogDescription>
            {t("SupplierUpdateDes")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="mb-2 block">
            {t("SupplierName")}
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("SupplierPlaceholderName")}
            className="w-full rounded-md border px-3 py-2"
          />

          <label className="mb-2 block mt-3">
            {t("phone")}
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("SupplierPlaceholderPhone")}
            className="w-full rounded-md border px-3 py-2"
          />

          <label className="mb-2 block mt-3">
            {t("email")}
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("SupplierPlaceholderEmail")}
            className="w-full rounded-md border px-3 py-2"
          />

          <label className="mb-2 block mt-3">
            {t("address")}
          </label>

          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t("SupplierPlaceholderAddress")}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !name}
          >
            {loading
              ? t("loading")
              : t("update")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}