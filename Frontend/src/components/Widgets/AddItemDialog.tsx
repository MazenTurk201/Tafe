import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/animate-ui/components/radix/dialog";

import { ProductsApi } from "@/api/productsApi";
import type { ProductSearchResult } from "@/types/product";

interface AddItemDialogProps {
  onConfirm: (
    product: ProductSearchResult,
    notes: string
  ) => Promise<void>;
}

export default function AddItemDialog({
  onConfirm,
}: AddItemDialogProps) {
  const [search, setSearch] = useState("");
  const [comment, setComment] = useState("");
  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductSearchResult | null>(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (!search.trim()) {
      setProducts([]);
      return;
    }

    const searchProducts = async () => {
      try {
        setSearchLoading(true);

        const result = await ProductsApi.Search(search);

        setProducts(result);
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setSearchLoading(false);
      }
    };

    searchProducts();
  }, [search, open]);

  const handleSubmit = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);

      await onConfirm(selectedProduct, comment);

      setSearch("");
      setProducts([]);
      setSelectedProduct(null);
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <button>
          Add Item
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            All Items
          </DialogTitle>

          <DialogDescription>
            Choose The Item
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a note..."
                className="w-full rounded-md border px-3 py-2"
                rows={3}
            />
          <label className="mb-2 block">
            Search
          </label>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ex: Coffee, Latte"
            className="w-full rounded-md border px-3 py-2"
          />

          {searchLoading && (
            <p className="mt-2 text-sm">
              Searching...
            </p>
          )}

          <div className="mt-4 space-y-2">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setSelectedProduct(product)}
                className={`w-full rounded-md border p-3 text-left ${
                  selectedProduct?.id === product.id
                    ? "border-primary"
                    : ""
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">
                    {product.name}
                  </span>

                  <span>
                    {product.price} EGP
                  </span>
                </div>

                <div className="text-sm text-gray-500">
                  {product.categiry}
                </div>
              </button>
            ))}
          </div>

          {!searchLoading &&
            search &&
            products.length === 0 && (
              <p className="mt-4 text-sm">
                No products found.
              </p>
            )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !selectedProduct}
          >
            {loading ? "Adding..." : "Add Item"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}