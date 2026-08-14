import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type {
  OrderType,
  OrderCreate,
  PaymentMethod,
} from "@/types/order";
import type { ProductSearchResult } from "@/types/product";
import type { CustomerProfile } from "@/types/customer";
import { ordersApi } from "@/api/ordersApi";
import { tablesApi } from "@/api/tablesApi";
import { customersApi } from "@/api/customersApi";
import type { CafeTable } from "@/types/cafeTable";
import { ShiftApi } from "@/api/shiftsApi";
import AddItemDialog from "@/components/Widgets/AddItemDialog";

interface DraftItem {
  product: ProductSearchResult;
  quantity: number;
  notes?: string;
}

const orderTypes: OrderType[] = [
  "DineIn",
  "TakeAway",
  "Delivery",
];

const paymentMethods: PaymentMethod[] = [
  "Cash",
  "Visa",
  "MasterCard",
  "InstaPay",
  "VodafoneCash",
  "Wallet",
  "GiftCard",
];

export default function NewOrderPage() {
  const navigate = useNavigate();

  const [orderType, setOrderType] =
    useState<OrderType>("DineIn");

  const [tables, setTables] = useState<CafeTable[]>([]);
  const [tableId, setTableId] = useState<number | null>(null);

  const [items, setItems] = useState<DraftItem[]>([]);

  const [hasActiveShift, setHasActiveShift] = useState(false);

  const [customerSearch, setCustomerSearch] =
    useState("");
  const [customerResults, setCustomerResults] =
    useState<CustomerProfile[]>([]);
  const [customerLoading, setCustomerLoading] =
    useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerProfile | null>(null);

  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [service, setService] = useState(0);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Cash");
  const [paymentAmount, setPaymentAmount] =
    useState<number | null>(null);
  const [transactionNumber, setTransactionNumber] =
    useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tablesApi
      .getAll()
      .then(setTables)
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const term = customerSearch.trim();

    const searchCustomers = async () => {
      if (!term) {
        setCustomerResults([]);
        setCustomerLoading(false);
        return;
      }

      try {
        setCustomerLoading(true);

        const result =
          await customersApi.search(term);

        setCustomerResults(result);
      } catch (err) {
        console.error(err);
        setCustomerResults([]);
      } finally {
        setCustomerLoading(false);
      }
    };

    searchCustomers();
  }, [customerSearch]);

  const availableTables = useMemo(
    () => tables.filter((table) => !table.isOccupied),
    [tables]
  );

  const subTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          item.product.price * item.quantity,
        0
      ),
    [items]
  );

  const total = useMemo(
    () => subTotal - discount + tax + service,
    [subTotal, discount, tax, service]
  );

  const addItem = async (
    product: ProductSearchResult,
    notes: string
  ) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id
      );

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                notes:
                  item.notes || notes || undefined,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          product,
          quantity: 1,
          notes: notes || undefined,
        },
      ];
    });
  };

  const changeQuantity = (
    productId: number,
    delta: number
  ) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: item.quantity + delta,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: number) => {
    setItems((prev) =>
      prev.filter(
        (item) => item.product.id !== productId
      )
    );
  };

  const selectTable = (id: number | null) => {
    setTableId(id);
    if (id) setOrderType("DineIn");
  };

  // Shifts
  
    useEffect(() => {
    const fetchShiftStatus = async () => {
      try {
        const status = await ShiftApi.GetStatus();
  
        setHasActiveShift(status);
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchShiftStatus();
  }, []);

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError(
        "Add at least one item to the order."
      );
      return;
    }

    const payload: OrderCreate = {
      customerId: selectedCustomer?.userId ?? null,
      tableId:
        orderType === "DineIn" ? tableId : null,
      orderType,
      discount,
      tax,
      service,
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        discount: 0,
        notes: item.notes,
      })),
    };

    try {
      setSubmitting(true);
      setError(null);

      const created = await ordersApi.create(payload);

      try {
        await ordersApi.addPayment({
          orderId: created.id,
          method: paymentMethod,
          amount: paymentAmount ?? total,
          transactionNumber:
            transactionNumber.trim() || undefined,
        });
      } catch (err) {
        console.error(err);
      }

      navigate(`/orders/${created.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create the order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full px-5 py-8">
      {hasActiveShift?
      <>
      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            to="/orders"
            className="text-sm text-zinc-500 hover:text-black"
          >
            ← Orders
          </Link>

          <h1 className="mt-2 text-3xl font-bold">
            New Order
          </h1>

          <p className="mt-1 text-zinc-500">
            Create a new cafe order
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: order details */}

        <section className="space-y-6 lg:col-span-3">
          {/* Order type */}

          <div
            className="
              rounded-2xl border border-zinc-200
              bg-white p-5
              dark:border-zinc-800 dark:bg-zinc-900
            "
          >
            <h2 className="mb-4 font-bold">
              Order Type
            </h2>

            <div className="flex flex-wrap gap-2">
              {orderTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`
                    rounded-xl px-4 py-2 text-sm font-medium
                    ${
                      orderType === type
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }
                  `}
                >
                  {type}
                </button>
              ))}
            </div>

            {orderType === "DineIn" && (
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-zinc-500">
                  Table
                </label>

                <div className="flex flex-wrap gap-2">
                  {availableTables.map((table) => (
                    <button
                      key={table.id}
                      onClick={() =>
                        selectTable(table.id)
                      }
                      className={`
                        rounded-xl px-4 py-2 text-sm font-medium
                        ${
                          tableId === table.id
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }
                      `}
                    >
                      {table.name}
                    </button>
                  ))}

                  {availableTables.length === 0 && (
                    <p className="text-sm text-zinc-500">
                      No free tables available.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Customer */}

          <div
            className="
              rounded-2xl border border-zinc-200
              bg-white p-5
              dark:border-zinc-800 dark:bg-zinc-900
            "
          >
            <h2 className="mb-4 font-bold">
              Customer
            </h2>

            {selectedCustomer ? (
              <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div>
                  <p className="font-semibold">
                    {selectedCustomer.fullName ||
                      selectedCustomer.userName}
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-500">
                    {selectedCustomer.email ||
                      selectedCustomer.userName}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setSelectedCustomer(null)
                  }
                  className="
                    rounded-lg px-3 py-2
                    text-red-500 hover:bg-red-50
                    dark:hover:bg-red-500/10
                  "
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) =>
                    setCustomerSearch(e.target.value)
                  }
                  placeholder="Search customers..."
                  className="
                    w-full rounded-xl border border-zinc-200
                    bg-white px-4 py-2 outline-none
                    focus:border-black
                    dark:border-zinc-800 dark:bg-zinc-900
                  "
                />

                {customerLoading && (
                  <p className="mt-2 text-sm text-zinc-500">
                    Searching...
                  </p>
                )}

                {!customerLoading &&
                  customerSearch.trim() &&
                  customerResults.length === 0 && (
                    <p className="mt-2 text-sm text-zinc-500">
                      No customers found.
                    </p>
                  )}

                {customerResults.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {customerResults.map((customer) => (
                      <button
                        key={customer.userId}
                        type="button"
                        onClick={() =>
                          setSelectedCustomer(customer)
                        }
                        className="
                          w-full rounded-xl border p-3
                          text-left hover:border-black
                          dark:hover:border-white
                        "
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {customer.fullName ||
                              customer.userName}
                          </span>

                          {customer.vip && (
                            <span
                              className="
                                rounded-full bg-purple-100
                                px-2 py-0.5 text-xs font-semibold
                                text-purple-700
                                dark:bg-purple-500/10 dark:text-purple-400
                              "
                            >
                              VIP
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 text-xs text-zinc-500">
                          {customer.email ||
                            customer.userName}
                          {" · "}
                          {customer.points} points
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Items */}

          <section
            className="
              overflow-hidden rounded-2xl border
              border-zinc-200 bg-white
              dark:border-zinc-800 dark:bg-zinc-900
            "
          >
            <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <h2 className="font-bold">
                Order Items
              </h2>

              <AddItemDialog onConfirm={addItem} />
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500">
                No items yet. Add products to the order.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-4 p-5"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">
                        {item.product.name}
                      </p>

                      {item.notes && (
                        <p className="mt-1 text-xs text-zinc-500">
                          {item.notes}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-zinc-500">
                        {item.product.price.toFixed(2)}{" "}
                        each
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          changeQuantity(
                            item.product.id,
                            -1
                          )
                        }
                        className="
                          h-8 w-8 rounded-lg
                          bg-zinc-100 hover:bg-zinc-200
                          dark:bg-zinc-800 dark:hover:bg-zinc-700
                        "
                      >
                        −
                      </button>

                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          changeQuantity(
                            item.product.id,
                            1
                          )
                        }
                        className="
                          h-8 w-8 rounded-lg
                          bg-zinc-100 hover:bg-zinc-200
                          dark:bg-zinc-800 dark:hover:bg-zinc-700
                        "
                      >
                        +
                      </button>
                    </div>

                    <div className="w-20 text-right font-bold">
                      {(
                        item.product.price *
                        item.quantity
                      ).toFixed(2)}
                    </div>

                    <button
                      onClick={() =>
                        removeItem(item.product.id)
                      }
                      className="
                        rounded-lg px-3 py-2
                        text-red-500 hover:bg-red-50
                        dark:hover:bg-red-500/10
                      "
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>

        {/* Right: charges & summary */}

        <section
          className="
            h-fit rounded-2xl border border-zinc-200
            bg-white p-5 lg:col-span-2
            dark:border-zinc-800 dark:bg-zinc-900
          "
        >
          <h2 className="mb-4 font-bold">Charges</h2>

          <div className="space-y-4">
            <NumberField
              label="Discount"
              value={discount}
              onChange={setDiscount}
            />

            <NumberField
              label="Tax"
              value={tax}
              onChange={setTax}
            />

            <NumberField
              label="Service"
              value={service}
              onChange={setService}
            />
          </div>

          <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <h2 className="mb-3 font-bold">Payment</h2>

            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  onClick={() =>
                    setPaymentMethod(method)
                  }
                  className={`
                    rounded-xl px-3 py-2 text-xs font-medium
                    ${
                      paymentMethod === method
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }
                  `}
                >
                  {method}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-4">
              <NumberField
                label="Amount"
                value={paymentAmount ?? total}
                onChange={setPaymentAmount}
              />

              {paymentMethod !== "Cash" && (
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-zinc-500">
                    Transaction Number
                  </span>

                  <input
                    type="text"
                    value={transactionNumber}
                    onChange={(e) =>
                      setTransactionNumber(e.target.value)
                    }
                    placeholder="Ex: 1234-5678"
                    className="
                      w-full rounded-xl border border-zinc-200
                      bg-white px-4 py-2 outline-none
                      focus:border-black
                      dark:border-zinc-800 dark:bg-zinc-900
                    "
                  />
                </label>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <Row title="Subtotal" value={subTotal} />
            <Row title="Discount" value={-discount} />
            <Row title="Tax" value={tax} />
            <Row title="Service" value={service} />

            <div className="mt-3 flex justify-between border-t border-zinc-200 pt-3 text-lg font-bold dark:border-zinc-700">
              <span>Total</span>
              <span>{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || items.length === 0}
            className="
              mt-6 w-full rounded-xl bg-black px-5
              py-3 text-sm font-semibold text-white
              hover:bg-zinc-800 disabled:cursor-not-allowed
              disabled:opacity-50
              dark:bg-white dark:text-black dark:hover:bg-zinc-200
            "
          >
            {submitting
              ? "Creating order..."
              : "Create Order"}
          </button>
        </section>
      </div>
      </>
      : <div className="h-dvh flex justify-center items-center text-center text-2xl font-bold pb-30 animate-pulse">Open Shift Plz..</div> }
    </main>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-500">
        {label}
      </span>

      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) =>
          onChange(Math.max(0, Number(e.target.value)))
        }
        className="
          w-full rounded-xl border border-zinc-200
          bg-white px-4 py-2 outline-none
          focus:border-black
          dark:border-zinc-800 dark:bg-zinc-900
        "
      />
    </label>
  );
}

function Row({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-500">{title}</span>
      <span>{value.toFixed(2)}</span>
    </div>
  );
}
