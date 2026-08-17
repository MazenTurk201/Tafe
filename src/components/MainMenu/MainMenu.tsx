import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import "./MainMenu.css";

type Page = "dashboard" | "orders" | "tables" | "customers" | "menu" | "statistics" | "settings";
type OrderStatus = "Pending" | "Preparing" | "Ready" | "Completed" | "Cancelled";

type Customer = {
  id: number;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
};

type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  available: boolean;
};

type OrderItem = {
  menuItemId: number;
  quantity: number;
  price: number;
};

type Order = {
  id: number;
  tableId: number | null;
  customerId: number | null;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
};

type CafeTable = {
  id: number;
  orderId: number | null;
};

type Settings = {
  darkMode: boolean;
  compactMode: boolean;
  confirmDelete: boolean;
};

type MainMenuProps = {
  onLogout?: () => void;
};

const STORAGE_KEY = "cafe-management-state-v2";
const PHONE_MAX_LENGTH = 15;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 120;
const MAX_MENU_NAME_LENGTH = 80;
const MAX_CATEGORY_LENGTH = 40;

const initialMenu: MenuItem[] = [];
const initialCustomers: Customer[] = [];
const initialOrders: Order[] = [];
const initialTables: CafeTable[] = Array.from({ length: 33 }, (_, i) => ({
  id: i + 1,
  orderId: null,
}));
const initialSettings: Settings = {
  darkMode: false,
  compactMode: false,
  confirmDelete: true,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function money(value: number) {
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe.toFixed(2)} EGP`;
}

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((x) => x[0]?.toUpperCase() ?? "").join("") || "?";
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, PHONE_MAX_LENGTH);
}

function cleanText(value: string, max: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function validPrice(value: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return false;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n <= 1000000;
}

function validQuantity(value: string) {
  if (!/^\d+$/.test(value.trim())) return false;
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 1 && n <= 999;
}

function nextId(items: Array<{ id: number }>) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function Icon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<string, ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    orders: <><path d="M6 3h12v18H6z" /><path d="M9 7h6M9 11h6M9 15h4" /></>,
    tables: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M8 9h8M8 13h8" /></>,
    customers: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20c.6-3.5 2.4-5.5 5.5-5.5s4.9 2 5.5 5.5M16 11c2.6.1 4.1 1.7 4.6 4" /></>,
    menu: <><path d="M4 5h16M4 12h16M4 19h16" /></>,
    statistics: <><path d="M4 19V5M4 19h16" /><path d="M8 16v-4M12 16V8M16 16v-7M20 16v-10" /></>,
    settings: <><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /><path d="m4.9 4.9 1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
    edit: <><path d="m4 20 4.2-.8L19 8.4a2 2 0 0 0-2.8-2.8L5.4 16.4 4 20Z" /><path d="m14.8 6.2 3 3" /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" /></>,
    close: <><path d="M6 6l12 12M18 6 6 18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <><path d="M4 12h15M13 6l6 6-6 6" /></>,
    moon: <path d="M20 15.2A8 8 0 0 1 8.8 4 8.1 8.1 0 1 0 20 15.2Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8M10 21h4" /></>,
  };
  return <svg {...common}>{paths[name] ?? paths.dashboard}</svg>;
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="data-empty">
      <div className="empty-icon"><Icon name="dashboard" /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export default function MainMenu({ onLogout }: MainMenuProps) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {
        customers: initialCustomers,
        menu: initialMenu,
        orders: initialOrders,
        tables: initialTables,
        settings: initialSettings,
      };
      const parsed = JSON.parse(raw);
      return {
        customers: Array.isArray(parsed.customers) ? parsed.customers : initialCustomers,
        menu: Array.isArray(parsed.menu) ? parsed.menu : initialMenu,
        orders: Array.isArray(parsed.orders) ? parsed.orders : initialOrders,
        tables: Array.isArray(parsed.tables) && parsed.tables.length === 33 ? parsed.tables : initialTables,
        settings: { ...initialSettings, ...(parsed.settings ?? {}) },
      };
    } catch {
      return {
        customers: initialCustomers,
        menu: initialMenu,
        orders: initialOrders,
        tables: initialTables,
        settings: initialSettings,
      };
    }
  });

  const { customers, menu, orders, tables, settings } = state;
  const [page, setPage] = useState<Page>("dashboard");
  const [modal, setModal] = useState<"customer" | "menu" | "order" | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can fail in private/blocked browser contexts; UI remains usable.
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", settings.darkMode);
    document.documentElement.classList.toggle("compact-mode", settings.compactMode);
    return () => {
      document.documentElement.classList.remove("dark-mode", "compact-mode");
    };
  }, [settings.darkMode, settings.compactMode]);

  const setData = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  const getOrderTotal = (order: Order) =>
    order.items.reduce((sum, item) => sum + (Number.isFinite(item.price) ? item.price : 0) * item.quantity, 0);

  const activeOrders = orders.filter((o) => !["Completed", "Cancelled"].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === "Completed");
  const today = new Date().toDateString();
  const todayCompleted = completedOrders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const revenue = todayCompleted.reduce((sum, o) => sum + getOrderTotal(o), 0);
  const occupiedTables = tables.filter((t) => t.orderId !== null).length;

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const go = (next: Page) => {
    setPage(next);
    setSearch("");
    setMobileOpen(false);
  };

  const createOrder = (tableId: number | null = null) => {
    if (tableId !== null) {
      const table = tables.find((t) => t.id === tableId);
      if (!table || table.orderId !== null) {
        showNotice("This table is already occupied.");
        return;
      }
    }
    const order: Order = {
      id: Date.now(),
      tableId,
      customerId: null,
      items: [],
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    setData("orders", [order, ...orders]);
    if (tableId !== null) {
      setData("tables", tables.map((t) => t.id === tableId ? { ...t, orderId: order.id } : t));
    }
    setSelectedOrderId(order.id);
    setSelectedTableId(tableId);
    setModal("order");
  };

  const updateOrder = (id: number, updater: (order: Order) => Order) => {
    setData("orders", orders.map((o) => o.id === id ? updater(o) : o));
  };

  const completeOrder = (id: number) => {
    const order = orders.find((o) => o.id === id);
    if (!order || order.items.length === 0) {
      showNotice("Add at least one item before completing the order.");
      return;
    }
    updateOrder(id, (o) => ({ ...o, status: "Completed" }));
    setData("tables", tables.map((t) => t.orderId === id ? { ...t, orderId: null } : t));
    showNotice("Order completed successfully.");
  };

  const cancelOrder = (id: number) => {
    const order = orders.find((o) => o.id === id);
    if (!order || order.status === "Completed" || order.status === "Cancelled") return;
    updateOrder(id, (o) => ({ ...o, status: "Cancelled" }));
    setData("tables", tables.map((t) => t.orderId === id ? { ...t, orderId: null } : t));
    showNotice("Order cancelled.");
  };

  const removeOrder = (id: number) => {
    if (settings.confirmDelete && !window.confirm("Delete this order permanently?")) return;
    setData("orders", orders.filter((o) => o.id !== id));
    setData("tables", tables.map((t) => t.orderId === id ? { ...t, orderId: null } : t));
    setModal(null);
    showNotice("Order deleted.");
  };

  const deleteCustomer = (id: number) => {
    if (settings.confirmDelete && !window.confirm("Delete this customer? Their existing orders will remain as walk-in orders.")) return;
    setData("customers", customers.filter((c) => c.id !== id));
    setData("orders", orders.map((o) => o.customerId === id ? { ...o, customerId: null } : o));
    showNotice("Customer deleted.");
  };

  const deleteMenuItem = (id: number) => {
    if (settings.confirmDelete && !window.confirm("Delete this menu item? Existing order lines will keep their saved price.")) return;
    setData("menu", menu.filter((m) => m.id !== id));
    showNotice("Menu item deleted.");
  };

  const resetData = () => {
    if (!window.confirm("Reset all local data? Customers, orders, tables and menu items will be cleared.")) return;
    setState({
      customers: [],
      menu: [],
      orders: [],
      tables: initialTables,
      settings,
    });
    showNotice("Local data reset.");
  };

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(q));
  }, [customers, search]);

  const filteredMenu = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return menu;
    return menu.filter((m) => `${m.name} ${m.category}`.toLowerCase().includes(q));
  }, [menu, search]);

  const navItems: { id: Page; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "orders", label: "Orders", icon: "orders" },
    { id: "tables", label: "Tables", icon: "tables" },
    { id: "customers", label: "Customers", icon: "customers" },
    { id: "menu", label: "Menu", icon: "menu" },
    { id: "statistics", label: "Statistics", icon: "statistics" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  const pageTitle = navItems.find((x) => x.id === page)?.label ?? "Dashboard";

  return (
    <main className="main-menu">
      {mobileOpen && <button className="sidebar-overlay" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark"><Icon name="menu" /></div>
          <div><strong>Cafe Management</strong><span>Management System</span></div>
        </div>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => go(item.id)}>
              <span className="nav-icon"><Icon name={item.icon} /></span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="logout-button" onClick={onLogout}><span className="nav-icon"><Icon name="logout" /></span>Sign out</button>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open menu">☰</button>
            <div className="page-heading"><span className="page-eyebrow">CAFE MANAGEMENT</span><h1>{pageTitle}</h1></div>
          </div>
          <div className="topbar-actions">
            <button className="notification-button" aria-label="Notifications"><Icon name="bell" /></button>
            <button className="user-profile" onClick={() => go("settings")}>
              <div className="user-avatar">AD</div>
              <div className="user-info"><strong>Administrator</strong><span>Manager</span></div>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {notice && <div className="toast" role="status"><Icon name="check" />{notice}</div>}

          {page === "dashboard" && (
            <>
              <div className="welcome-section">
                <div><span className="section-eyebrow">OVERVIEW</span><h2>Good morning, Administrator</h2><p>Everything in the workspace is calculated from the current local data.</p></div>
                <button className="primary-action" onClick={() => createOrder()}><Icon name="plus" /> Create Order</button>
              </div>
              <div className="stats-grid">
                <div className="stat-card"><span className="stat-label">TODAY'S REVENUE</span><strong>{money(revenue)}</strong><p>Completed orders today</p></div>
                <div className="stat-card"><span className="stat-label">ACTIVE ORDERS</span><strong>{activeOrders.length}</strong><p>Currently in progress</p></div>
                <div className="stat-card"><span className="stat-label">OCCUPIED TABLES</span><strong>{occupiedTables} / 33</strong><p>Tables currently in use</p></div>
                <div className="stat-card"><span className="stat-label">CUSTOMERS</span><strong>{customers.length}</strong><p>Registered customers</p></div>
              </div>
              <div className="dashboard-grid">
                <section className="dashboard-card">
                  <div className="card-header"><div><h3>Recent orders</h3><p>Latest activity</p></div><button className="text-action" onClick={() => go("orders")}>View all</button></div>
                  {orders.length === 0 ? <EmptyState title="No orders yet" text="Create an order to start using the system." action={<button className="empty-action" onClick={() => createOrder()}>Create order</button>} /> : (
                    <div className="orders-list">{orders.slice(0, 6).map((order) => {
                      const customer = customers.find((c) => c.id === order.customerId);
                      return <div className="order-row" key={order.id}>
                        <div className="order-main"><strong>{customer?.name ?? "Walk-in customer"}</strong><span>{order.tableId ? `Table ${order.tableId}` : "Takeaway"} · {dateLabel(order.createdAt)}</span></div>
                        <div className="order-item"><strong>{order.items.reduce((s, x) => s + x.quantity, 0)} item(s)</strong><span>{order.status}</span></div>
                        <div className="order-total">{money(getOrderTotal(order))}</div>
                        <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                      </div>;
                    })}</div>
                  )}
                </section>
                <section className="dashboard-card">
                  <div className="card-header"><div><h3>Quick actions</h3><p>Common tasks</p></div></div>
                  <div className="quick-actions">
                    <button className="quick-action" onClick={() => createOrder()}><span className="quick-action-icon"><Icon name="plus" /></span><span><strong>Create Order</strong><small>Start a new order</small></span></button>
                    <button className="quick-action" onClick={() => { setEditingCustomer(null); setModal("customer"); }}><span className="quick-action-icon"><Icon name="customers" /></span><span><strong>Add Customer</strong><small>Register a customer</small></span></button>
                    <button className="quick-action" onClick={() => { setEditingMenuItem(null); setModal("menu"); }}><span className="quick-action-icon"><Icon name="menu" /></span><span><strong>Add Menu Item</strong><small>Add a product</small></span></button>
                    <button className="quick-action" onClick={() => go("tables")}><span className="quick-action-icon"><Icon name="tables" /></span><span><strong>Manage Tables</strong><small>Open a table</small></span></button>
                  </div>
                </section>
              </div>
            </>
          )}

          {page === "orders" && <OrdersPage orders={orders} customers={customers} getTotal={getOrderTotal} onCreate={() => createOrder()} onOpen={(id) => { setSelectedOrderId(id); setSelectedTableId(orders.find((o) => o.id === id)?.tableId ?? null); setModal("order"); }} onComplete={completeOrder} onCancel={cancelOrder} />}
          {page === "tables" && <TablesPage tables={tables} orders={orders} customers={customers} getTotal={getOrderTotal} onOpen={(id) => {
            const table = tables.find((t) => t.id === id);
            if (table?.orderId) {
              setSelectedOrderId(table.orderId);
              setSelectedTableId(id);
              setModal("order");
            } else createOrder(id);
          }} onRelease={(id) => { const t = tables.find((x) => x.id === id); if (t?.orderId) completeOrder(t.orderId); }} />}
          {page === "customers" && <CustomersPage customers={filteredCustomers} allCount={customers.length} orders={orders} getTotal={getOrderTotal} onAdd={() => { setEditingCustomer(null); setModal("customer"); }} onEdit={(c) => { setEditingCustomer(c); setModal("customer"); }} onDelete={deleteCustomer} search={search} setSearch={setSearch} />}
          {page === "menu" && <MenuPage items={filteredMenu} allCount={menu.length} onAdd={() => { setEditingMenuItem(null); setModal("menu"); }} onEdit={(m) => { setEditingMenuItem(m); setModal("menu"); }} onDelete={deleteMenuItem} search={search} setSearch={setSearch} />}
          {page === "statistics" && <StatisticsPage orders={orders} customers={customers} menu={menu} tables={tables} getTotal={getOrderTotal} />}
          {page === "settings" && <SettingsPage settings={settings} setSettings={(updater) => setData("settings", typeof updater === "function" ? updater(settings) : updater)} resetData={resetData} />}
        </div>
      </section>

      {modal === "customer" && (
        <CustomerModal
          customer={editingCustomer}
          existingCustomers={customers}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (editingCustomer) {
              setData("customers", customers.map((c) => c.id === editingCustomer.id ? { ...c, ...data } : c));
              showNotice("Customer updated.");
            } else {
              setData("customers", [{ id: nextId(customers), ...data, createdAt: new Date().toISOString() }, ...customers]);
              showNotice("Customer added.");
            }
            setModal(null);
          }}
        />
      )}

      {modal === "menu" && (
        <MenuModal
          item={editingMenuItem}
          existingItems={menu}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (editingMenuItem) {
              setData("menu", menu.map((m) => m.id === editingMenuItem.id ? { ...m, ...data } : m));
              showNotice("Menu item updated.");
            } else {
              setData("menu", [{ id: nextId(menu), ...data }, ...menu]);
              showNotice("Menu item added.");
            }
            setModal(null);
          }}
        />
      )}

      {modal === "order" && (
        <OrderModal
          order={orders.find((o) => o.id === selectedOrderId) ?? null}
          tableId={selectedTableId}
          customers={customers}
          menu={menu}
          getTotal={getOrderTotal}
          onClose={() => setModal(null)}
          onUpdate={updateOrder}
          onCreateCustomer={() => { setEditingCustomer(null); setModal("customer"); }}
          onComplete={completeOrder}
          onDelete={removeOrder}
        />
      )}
    </main>
  );
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="data-page-header"><div><span className="section-eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>{action}</div>;
}

function OrdersPage({ orders, customers, getTotal, onCreate, onOpen, onComplete, onCancel }: {
  orders: Order[]; customers: Customer[]; getTotal: (o: Order) => number; onCreate: () => void; onOpen: (id: number) => void; onComplete: (id: number) => void; onCancel: (id: number) => void;
}) {
  return <section className="data-page">
    <PageHeader eyebrow="ORDERS" title="Orders" description="Create, edit and track every order." action={<button className="primary-action" onClick={onCreate}><Icon name="plus" /> Create Order</button>} />
    {orders.length === 0 ? <EmptyState title="No orders yet" text="Orders created from tables or this page will appear here." /> :
      <div className="orders-page-list">{orders.map((order) => {
        const customer = customers.find((c) => c.id === order.customerId);
        const locked = order.status === "Completed" || order.status === "Cancelled";
        return <div className="full-order-row" key={order.id}>
          <span className="order-number">#{String(order.id).slice(-5)}</span>
          <div className="full-order-customer"><strong>{customer?.name ?? "Walk-in customer"}</strong><span>{order.tableId ? `Table ${order.tableId}` : "Takeaway"} · {dateLabel(order.createdAt)} · {order.items.length} line(s)</span></div>
          <strong className="full-order-total">{money(getTotal(order))}</strong>
          <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
          <div className="row-actions"><button onClick={() => onOpen(order.id)}>Open</button>{!locked && <><button onClick={() => onComplete(order.id)}><Icon name="check" /> Complete</button><button className="danger" onClick={() => onCancel(order.id)}>Cancel</button></>}</div>
        </div>;
      })}</div>}
  </section>;
}

function TablesPage({ tables, orders, customers, getTotal, onOpen, onRelease }: {
  tables: CafeTable[]; orders: Order[]; customers: Customer[]; getTotal: (o: Order) => number; onOpen: (id: number) => void; onRelease: (id: number) => void;
}) {
  return <section className="data-page">
    <PageHeader eyebrow="TABLES" title="Tables" description="33 tables with live status and current order totals." />
    <div className="table-summary"><span><b>{tables.filter((t) => !t.orderId).length}</b> available</span><span><b>{tables.filter((t) => t.orderId).length}</b> occupied</span><span><b>33</b> total</span></div>
    <div className="tables-grid">{tables.map((table) => {
      const order = orders.find((o) => o.id === table.orderId);
      const customer = order ? customers.find((c) => c.id === order.customerId) : null;
      return <button className={`table-card ${order ? "occupied" : ""}`} key={table.id} onClick={() => onOpen(table.id)}>
        <div className="table-card-top"><span>TABLE</span><strong>{String(table.id).padStart(2, "0")}</strong></div>
        <div className="table-status">{order ? "Occupied" : "Available"}</div>
        {order ? <><div className="table-customer">{customer?.name ?? "Walk-in customer"}</div><div className="table-total">{money(getTotal(order))}</div><div className="table-items">{order.items.reduce((s, x) => s + x.quantity, 0)} item(s)</div><span className="table-release" onClick={(e) => { e.stopPropagation(); onRelease(table.id); }}>Complete & release</span></> : <div className="table-open">Open table <Icon name="arrow" /></div>}
      </button>;
    })}</div>
  </section>;
}

function CustomersPage({ customers, allCount, orders, getTotal, onAdd, onEdit, onDelete, search, setSearch }: {
  customers: Customer[]; allCount: number; orders: Order[]; getTotal: (o: Order) => number; onAdd: () => void; onEdit: (c: Customer) => void; onDelete: (id: number) => void; search: string; setSearch: (v: string) => void;
}) {
  return <section className="data-page">
    <PageHeader eyebrow="CUSTOMERS" title="Customers" description="Manage customer profiles and order history." action={<button className="primary-action" onClick={onAdd}><Icon name="plus" /> Add Customer</button>} />
    <div className="toolbar"><div className="search-box"><Icon name="search" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." /></div><span className="result-count">{customers.length} of {allCount}</span></div>
    {customers.length === 0 ? <EmptyState title={allCount ? "No customers found" : "No customers yet"} text={allCount ? "Try a different search." : "Add a customer to start building customer history."} /> :
      <div className="data-list">{customers.map((customer) => {
        const customerOrders = orders.filter((o) => o.customerId === customer.id);
        const spent = customerOrders.filter((o) => o.status === "Completed").reduce((s, o) => s + getTotal(o), 0);
        return <div className="customer-row" key={customer.id}>
          <div className="customer-avatar">{initials(customer.name)}</div>
          <div className="customer-details"><strong>{customer.name}</strong><span>{customer.phone || "No phone"} · {customer.email || "No email"}</span></div>
          <div className="customer-metric"><strong>{customerOrders.length}</strong><span>orders</span></div>
          <div className="customer-metric"><strong>{money(spent)}</strong><span>spent</span></div>
          <div className="row-actions"><button onClick={() => onEdit(customer)} aria-label={`Edit ${customer.name}`}><Icon name="edit" /></button><button className="danger" onClick={() => onDelete(customer.id)} aria-label={`Delete ${customer.name}`}><Icon name="trash" /></button></div>
        </div>;
      })}</div>}
  </section>;
}

function MenuPage({ items, allCount, onAdd, onEdit, onDelete, search, setSearch }: {
  items: MenuItem[]; allCount: number; onAdd: () => void; onEdit: (m: MenuItem) => void; onDelete: (id: number) => void; search: string; setSearch: (v: string) => void;
}) {
  return <section className="data-page">
    <PageHeader eyebrow="MENU" title="Menu items" description="Manage products, prices and availability." action={<button className="primary-action" onClick={onAdd}><Icon name="plus" /> Add Menu Item</button>} />
    <div className="toolbar"><div className="search-box"><Icon name="search" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search menu..." /></div><span className="result-count">{items.length} of {allCount}</span></div>
    {items.length === 0 ? <EmptyState title={allCount ? "No menu items found" : "No menu items yet"} text={allCount ? "Try a different search." : "Add menu items before creating orders."} action={<button className="empty-action" onClick={onAdd}>Add menu item</button>} /> :
      <div className="menu-grid">{items.map((item) => <article className="menu-item-card" key={item.id}>
        <div><span className="menu-category">{item.category}</span><h3>{item.name}</h3></div>
        <div className="menu-card-bottom"><strong>{money(item.price)}</strong><span className={`availability ${item.available ? "available" : "unavailable"}`}>{item.available ? "Available" : "Unavailable"}</span></div>
        <div className="card-actions"><button onClick={() => onEdit(item)}><Icon name="edit" /> Edit</button><button className="danger" onClick={() => onDelete(item.id)}><Icon name="trash" /> Delete</button></div>
      </article>)}</div>}
  </section>;
}

function StatisticsPage({ orders, customers, menu, tables, getTotal }: { orders: Order[]; customers: Customer[]; menu: MenuItem[]; tables: CafeTable[]; getTotal: (o: Order) => number }) {
  const completed = orders.filter((o) => o.status === "Completed");
  const revenue = completed.reduce((s, o) => s + getTotal(o), 0);
  const average = completed.length ? revenue / completed.length : 0;
  const quantities = new Map<number, number>();
  completed.forEach((o) => o.items.forEach((i) => quantities.set(i.menuItemId, (quantities.get(i.menuItemId) ?? 0) + i.quantity)));
  const best = [...quantities.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return <section className="data-page">
    <PageHeader eyebrow="STATISTICS" title="Statistics" description="All figures are calculated from the current orders." />
    <div className="stats-grid statistics-grid">
      <div className="stat-card"><span className="stat-label">TOTAL REVENUE</span><strong>{money(revenue)}</strong><p>Completed orders</p></div>
      <div className="stat-card"><span className="stat-label">TOTAL ORDERS</span><strong>{orders.length}</strong><p>{completed.length} completed</p></div>
      <div className="stat-card"><span className="stat-label">AVERAGE ORDER</span><strong>{money(average)}</strong><p>Completed order average</p></div>
      <div className="stat-card"><span className="stat-label">ACTIVE TABLES</span><strong>{tables.filter((t) => t.orderId).length}</strong><p>Out of 33 tables</p></div>
    </div>
    <div className="statistics-layout">
      <section className="dashboard-card"><div className="card-header"><div><h3>Order status</h3><p>Current distribution</p></div></div>
        <div className="status-list">{(["Pending", "Preparing", "Ready", "Completed", "Cancelled"] as OrderStatus[]).map((status) => {
          const count = orders.filter((o) => o.status === status).length;
          const pct = orders.length ? (count / orders.length) * 100 : 0;
          return <div className="status-row" key={status}><span>{status}</span><div className="progress"><i style={{ width: `${pct}%` }} /></div><strong>{count}</strong></div>;
        })}</div>
      </section>
      <section className="dashboard-card"><div className="card-header"><div><h3>Best selling items</h3><p>Completed orders only</p></div></div>
        {best.length === 0 ? <div className="card-empty">No completed sales data yet.</div> : <div className="best-list">{best.map(([id, quantity], i) => <div className="best-row" key={id}><span>{String(i + 1).padStart(2, "0")}</span><strong>{menu.find((m) => m.id === id)?.name ?? "Deleted item"}</strong><em>{quantity} sold</em></div>)}</div>}
      </section>
    </div>
    <div className="statistics-note">Customers: <b>{customers.length}</b> · Menu items: <b>{menu.length}</b> · Revenue excludes cancelled and pending orders.</div>
  </section>;
}

function SettingsPage({ settings, setSettings, resetData }: { settings: Settings; setSettings: (u: Settings | ((s: Settings) => Settings)) => void; resetData: () => void }) {
  return <section className="data-page">
    <PageHeader eyebrow="SETTINGS" title="Settings" description="Simple workspace preferences." />
    <div className="settings-list">
      <div className="setting-row"><div><strong>{settings.darkMode ? "Dark mode" : "Light mode"}</strong><span>Change the application appearance.</span></div><button className={`toggle ${settings.darkMode ? "on" : ""}`} onClick={() => setSettings((s) => ({ ...s, darkMode: !s.darkMode }))} aria-label="Toggle dark mode"><i /></button></div>
      <div className="setting-row"><div><strong>Compact layout</strong><span>Reduce spacing on data-heavy screens.</span></div><button className={`toggle ${settings.compactMode ? "on" : ""}`} onClick={() => setSettings((s) => ({ ...s, compactMode: !s.compactMode }))} aria-label="Toggle compact layout"><i /></button></div>
      <div className="setting-row"><div><strong>Confirm before deleting</strong><span>Require confirmation before destructive actions.</span></div><button className={`toggle ${settings.confirmDelete ? "on" : ""}`} onClick={() => setSettings((s) => ({ ...s, confirmDelete: !s.confirmDelete }))} aria-label="Toggle delete confirmation"><i /></button></div>
    </div>
    <div className="settings-danger"><div><strong>Reset local data</strong><span>Clear customers, menu items and orders stored in this browser.</span></div><button className="secondary-action danger-button" onClick={resetData}>Reset data</button></div>
  </section>;
}

function ModalShell({ eyebrow, title, onClose, children }: { eyebrow: string; title: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-header"><div><span className="section-eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" /></button></div>
      {children}
    </div>
  </div>;
}

function CustomerModal({ customer, existingCustomers, onClose, onSave }: {
  customer: Customer | null; existingCustomers: Customer[]; onClose: () => void; onSave: (data: Omit<Customer, "id" | "createdAt">) => void;
}) {
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = cleanText(name, MAX_NAME_LENGTH);
    const cleanPhone = onlyDigits(phone);
    const cleanEmail = email.trim().slice(0, MAX_EMAIL_LENGTH).toLowerCase();

    if (cleanName.length < MIN_NAME_LENGTH) return setError("Full name must contain at least 2 characters.");
    if (cleanPhone && (cleanPhone.length < 7 || cleanPhone.length > PHONE_MAX_LENGTH)) return setError("Phone number must contain 7 to 15 digits.");
    if (cleanEmail && !emailPattern.test(cleanEmail)) return setError("Enter a valid email address.");
    if (existingCustomers.some((c) => c.id !== customer?.id && cleanPhone && c.phone === cleanPhone)) return setError("This phone number is already registered.");
    if (existingCustomers.some((c) => c.id !== customer?.id && cleanEmail && c.email.toLowerCase() === cleanEmail)) return setError("This email address is already registered.");

    onSave({ name: cleanName, phone: cleanPhone, email: cleanEmail });
  };

  return <ModalShell eyebrow="CUSTOMER" title={customer ? "Edit customer" : "Add customer"} onClose={onClose}>
    <form className="modal-form" onSubmit={submit} noValidate>
      <label htmlFor="customer-name">Full name<input id="customer-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={MAX_NAME_LENGTH} placeholder="Enter customer name" autoFocus /></label>
      <label htmlFor="customer-phone">Phone number<input id="customer-phone" value={phone} onChange={(e) => setPhone(onlyDigits(e.target.value))} maxLength={PHONE_MAX_LENGTH} inputMode="numeric" pattern="[0-9]*" autoComplete="tel" placeholder="Digits only" /></label>
      <label htmlFor="customer-email">Email address<input id="customer-email" value={email} onChange={(e) => setEmail(e.target.value.slice(0, MAX_EMAIL_LENGTH))} maxLength={MAX_EMAIL_LENGTH} type="email" autoComplete="email" placeholder="Enter email address" /></label>
      {error && <div className="modal-error" role="alert">{error}</div>}
      <div className="modal-actions"><button type="button" className="modal-secondary" onClick={onClose}>Cancel</button><button className="primary-action" type="submit">{customer ? "Save changes" : "Add customer"}</button></div>
    </form>
  </ModalShell>;
}

function MenuModal({ item, existingItems, onClose, onSave }: {
  item: MenuItem | null; existingItems: MenuItem[]; onClose: () => void; onSave: (data: Omit<MenuItem, "id">) => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [price, setPrice] = useState(item?.price?.toFixed(2) ?? "");
  const [available, setAvailable] = useState(item?.available ?? true);
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = cleanText(name, MAX_MENU_NAME_LENGTH);
    const cleanCategory = cleanText(category, MAX_CATEGORY_LENGTH);
    if (cleanName.length < 2) return setError("Item name must contain at least 2 characters.");
    if (!cleanCategory) return setError("Category is required.");
    if (!validPrice(price)) return setError("Enter a valid price greater than 0 with up to 2 decimal places.");
    if (existingItems.some((m) => m.id !== item?.id && m.name.toLowerCase() === cleanName.toLowerCase())) return setError("A menu item with this name already exists.");
    onSave({ name: cleanName, category: cleanCategory, price: Number(price), available });
  };

  return <ModalShell eyebrow="MENU" title={item ? "Edit menu item" : "Add menu item"} onClose={onClose}>
    <form className="modal-form" onSubmit={submit} noValidate>
      <label htmlFor="menu-name">Item name<input id="menu-name" value={name} onChange={(e) => setName(e.target.value.slice(0, MAX_MENU_NAME_LENGTH))} maxLength={MAX_MENU_NAME_LENGTH} placeholder="e.g. Cappuccino" autoFocus /></label>
      <label htmlFor="menu-category">Category<input id="menu-category" value={category} onChange={(e) => setCategory(e.target.value.slice(0, MAX_CATEGORY_LENGTH))} maxLength={MAX_CATEGORY_LENGTH} placeholder="e.g. Coffee" /></label>
      <label htmlFor="menu-price">Price<input id="menu-price" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1").slice(0, 12))} inputMode="decimal" placeholder="0.00" /></label>
      <label className="inline-check"><input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /><span>Available for ordering</span></label>
      {error && <div className="modal-error" role="alert">{error}</div>}
      <div className="modal-actions"><button type="button" className="modal-secondary" onClick={onClose}>Cancel</button><button className="primary-action" type="submit">{item ? "Save changes" : "Add item"}</button></div>
    </form>
  </ModalShell>;
}

function OrderModal({ order, tableId, customers, menu, getTotal, onClose, onUpdate, onCreateCustomer, onComplete, onDelete }: {
  order: Order | null; tableId: number | null; customers: Customer[]; menu: MenuItem[]; getTotal: (o: Order) => number; onClose: () => void; onUpdate: (id: number, updater: (o: Order) => Order) => void; onCreateCustomer: () => void; onComplete: (id: number) => void; onDelete: (id: number) => void;
}) {
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState("");

  if (!order) return <ModalShell eyebrow="ORDER" title="Order unavailable" onClose={onClose}><div className="card-empty">This order no longer exists.</div></ModalShell>;

  const locked = order.status === "Completed" || order.status === "Cancelled";
  const addItem = () => {
    setError("");
    if (locked) return;
    if (!selectedItem) return setError("Select a menu item.");
    if (!validQuantity(quantity)) return setError("Quantity must be a whole number from 1 to 999.");
    const id = Number(selectedItem);
    const qty = Number(quantity);
    const item = menu.find((m) => m.id === id);
    if (!item || !item.available) return setError("That menu item is unavailable.");
    onUpdate(order.id, (current) => {
      const existing = current.items.find((x) => x.menuItemId === id);
      return {
        ...current,
        items: existing
          ? current.items.map((x) => x.menuItemId === id ? { ...x, quantity: Math.min(999, x.quantity + qty) } : x)
          : [...current.items, { menuItemId: id, quantity: qty, price: item.price }],
      };
    });
    setSelectedItem("");
    setQuantity("1");
  };

  const changeQuantity = (menuItemId: number, delta: number) => {
    if (locked) return;
    onUpdate(order.id, (current) => ({
      ...current,
      items: current.items.map((x) => x.menuItemId === menuItemId ? { ...x, quantity: Math.max(0, Math.min(999, x.quantity + delta)) } : x).filter((x) => x.quantity > 0),
    }));
  };

  return <ModalShell eyebrow={tableId ? `TABLE ${tableId}` : "ORDER"} title={`Order #${String(order.id).slice(-5)}`} onClose={onClose}>
    <div className="order-editor">
      <div className="order-editor-meta">
        <label>Customer<select disabled={locked} value={order.customerId ?? ""} onChange={(e) => onUpdate(order.id, (o) => ({ ...o, customerId: e.target.value ? Number(e.target.value) : null }))}>
          <option value="">Walk-in customer</option>{customers.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
        </select></label>
        {!locked && <button type="button" className="text-action" onClick={onCreateCustomer}>+ New customer</button>}
      </div>
      {!locked && <div className="add-line">
        <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}><option value="">Select menu item</option>{menu.filter((m) => m.available).map((m) => <option value={m.id} key={m.id}>{m.name} · {money(m.price)}</option>)}</select>
        <input value={quantity} onChange={(e) => setQuantity(e.target.value.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" aria-label="Quantity" />
        <button className="primary-action" type="button" onClick={addItem}><Icon name="plus" /> Add</button>
      </div>}
      {error && <div className="modal-error" role="alert">{error}</div>}
      <div className="order-lines">
        {order.items.length === 0 ? <div className="order-line-empty">No items in this order yet.</div> : order.items.map((line) => {
          const item = menu.find((m) => m.id === line.menuItemId);
          return <div className="order-line" key={line.menuItemId}>
            <div><strong>{item?.name ?? "Deleted item"}</strong><span>{money(line.price)} each</span></div>
            <div className="quantity-control">{!locked && <button type="button" onClick={() => changeQuantity(line.menuItemId, -1)}>-</button>}<b>{line.quantity}</b>{!locked && <button type="button" onClick={() => changeQuantity(line.menuItemId, 1)}>+</button>}</div>
            <strong>{money(line.price * line.quantity)}</strong>
          </div>;
        })}
      </div>
      <div className="order-editor-total"><span>Total</span><strong>{money(getTotal(order))}</strong></div>
      <label className="modal-status">Status<select disabled={locked} value={order.status} onChange={(e) => onUpdate(order.id, (o) => ({ ...o, status: e.target.value as OrderStatus }))}>
        {(["Pending", "Preparing", "Ready", "Completed", "Cancelled"] as OrderStatus[]).map((s) => <option key={s}>{s}</option>)}
      </select></label>
      <div className="modal-actions">
        <button type="button" className="modal-secondary danger-text" onClick={() => onDelete(order.id)}>Delete</button>
        <div className="modal-actions-right"><button type="button" className="modal-secondary" onClick={onClose}>Close</button>{!locked && order.items.length > 0 && <button type="button" className="primary-action" onClick={() => onComplete(order.id)}>Complete order</button>}</div>
      </div>
    </div>
  </ModalShell>;
}