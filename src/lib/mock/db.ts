import type { Category, Customer, Product, Sale } from "./types";

// In-memory mock database. Replace these modules with real data calls later.

let categories: Category[] = [
  { id: "c1", name: "Beverages", description: "Soft drinks, juices, water", createdAt: "2026-01-04" },
  { id: "c2", name: "Snacks", description: "Chips, biscuits, chocolate", createdAt: "2026-01-08" },
  { id: "c3", name: "Electronics", description: "Small consumer electronics", createdAt: "2026-02-11" },
  { id: "c4", name: "Household", description: "Cleaning and home essentials", createdAt: "2026-02-19" },
  { id: "c5", name: "Stationery", description: "Office and school supplies", createdAt: "2026-03-02" },
];

const img = (seed: string) => `https://picsum.photos/seed/${seed}/200/200`;

let products: Product[] = [
  { id: "p1", name: "Sparkling Water 500ml", sku: "BEV-001", imageUrl: img("water"), categoryId: "c1", buyingPrice: 0.6, sellingPrice: 1.2, stock: 240, minStock: 60, createdAt: "2026-01-10" },
  { id: "p2", name: "Orange Juice 1L", sku: "BEV-002", imageUrl: img("juice"), categoryId: "c1", buyingPrice: 1.4, sellingPrice: 2.6, stock: 42, minStock: 50, createdAt: "2026-01-12" },
  { id: "p3", name: "Salted Chips 150g", sku: "SNK-001", imageUrl: img("chips"), categoryId: "c2", buyingPrice: 0.9, sellingPrice: 1.9, stock: 130, minStock: 40, createdAt: "2026-01-18" },
  { id: "p4", name: "Dark Chocolate Bar", sku: "SNK-002", imageUrl: img("choco"), categoryId: "c2", buyingPrice: 1.1, sellingPrice: 2.4, stock: 18, minStock: 25, createdAt: "2026-01-22" },
  { id: "p5", name: "USB-C Cable 1m", sku: "ELC-001", imageUrl: img("cable"), categoryId: "c3", buyingPrice: 2.2, sellingPrice: 6.5, stock: 76, minStock: 20, createdAt: "2026-02-02" },
  { id: "p6", name: "Wireless Mouse", sku: "ELC-002", imageUrl: img("mouse"), categoryId: "c3", buyingPrice: 7.5, sellingPrice: 15.9, stock: 9, minStock: 15, createdAt: "2026-02-05" },
  { id: "p7", name: "Bluetooth Speaker", sku: "ELC-003", imageUrl: img("speaker"), categoryId: "c3", buyingPrice: 18, sellingPrice: 34.5, stock: 23, minStock: 10, createdAt: "2026-02-09" },
  { id: "p8", name: "Dish Soap 750ml", sku: "HHD-001", imageUrl: img("soap"), categoryId: "c4", buyingPrice: 1.3, sellingPrice: 2.8, stock: 88, minStock: 30, createdAt: "2026-02-14" },
  { id: "p9", name: "Microfiber Cloth 3pk", sku: "HHD-002", imageUrl: img("cloth"), categoryId: "c4", buyingPrice: 1.8, sellingPrice: 4.2, stock: 12, minStock: 20, createdAt: "2026-02-21" },
  { id: "p10", name: "A4 Notebook 200p", sku: "STA-001", imageUrl: img("notebook"), categoryId: "c5", buyingPrice: 1.2, sellingPrice: 3.1, stock: 164, minStock: 40, createdAt: "2026-03-01" },
  { id: "p11", name: "Gel Pen Pack", sku: "STA-002", imageUrl: img("pen"), categoryId: "c5", buyingPrice: 0.8, sellingPrice: 2.2, stock: 5, minStock: 30, createdAt: "2026-03-04" },
  { id: "p12", name: "Sticky Notes Cube", sku: "STA-003", imageUrl: img("sticky"), categoryId: "c5", buyingPrice: 1.0, sellingPrice: 2.9, stock: 61, minStock: 25, createdAt: "2026-03-09" },
  { id: "p13", name: "Cold Brew Can", sku: "BEV-003", imageUrl: img("coldbrew"), categoryId: "c1", buyingPrice: 1.6, sellingPrice: 3.4, stock: 54, minStock: 30, createdAt: "2026-03-12" },
  { id: "p14", name: "Trail Mix 250g", sku: "SNK-003", imageUrl: img("trailmix"), categoryId: "c2", buyingPrice: 2.4, sellingPrice: 5.1, stock: 37, minStock: 20, createdAt: "2026-03-16" },
  { id: "p15", name: "Laundry Pods 30ct", sku: "HHD-003", imageUrl: img("pods"), categoryId: "c4", buyingPrice: 6.9, sellingPrice: 12.5, stock: 44, minStock: 15, createdAt: "2026-03-20" },
];

let customers: Customer[] = [
  { id: "u1", name: "Amara Diallo", phone: "+1 202 555 0142", email: "amara@northside.co", address: "412 Northside Ave, Boston", creditBalance: 120.5, createdAt: "2026-01-06" },
  { id: "u2", name: "Peter Lindqvist", phone: "+46 70 555 2211", email: "peter@lindq.se", address: "Storgatan 8, Malmö", creditBalance: 0, createdAt: "2026-01-19" },
  { id: "u3", name: "Rina Sharma", phone: "+91 98 5544 1120", email: "rina.sharma@vertex.in", address: "Sector 21, Pune", creditBalance: 340, createdAt: "2026-02-03" },
  { id: "u4", name: "Tomás Ferreira", phone: "+351 91 555 8890", email: "tomas@casaverde.pt", address: "Rua do Sol 19, Porto", creditBalance: 58.25, createdAt: "2026-02-17" },
  { id: "u5", name: "Hana Suzuki", phone: "+81 80 5555 6612", email: "hana@sakuramart.jp", address: "3-8 Shibuya, Tokyo", creditBalance: 0, createdAt: "2026-03-05" },
  { id: "u6", name: "Grace Owusu", phone: "+233 24 555 7712", email: "grace@accrasupply.gh", address: "Ring Road East, Accra", creditBalance: 210.75, createdAt: "2026-03-21" },
];

let sales: Sale[] = [
  { id: "s1", invoiceNumber: "INV-2026-0148", customerId: "u1", total: 428.4, paymentStatus: "paid", date: "2026-08-05" },
  { id: "s2", invoiceNumber: "INV-2026-0147", customerId: "u3", total: 1290, paymentStatus: "partial", date: "2026-08-04" },
  { id: "s3", invoiceNumber: "INV-2026-0146", customerId: "u2", total: 86.9, paymentStatus: "paid", date: "2026-08-04" },
  { id: "s4", invoiceNumber: "INV-2026-0145", customerId: "u5", total: 312.15, paymentStatus: "pending", date: "2026-08-03" },
  { id: "s5", invoiceNumber: "INV-2026-0144", customerId: "u6", total: 745.6, paymentStatus: "paid", date: "2026-08-02" },
  { id: "s6", invoiceNumber: "INV-2026-0143", customerId: "u4", total: 158.2, paymentStatus: "paid", date: "2026-08-01" },
  { id: "s7", invoiceNumber: "INV-2026-0142", customerId: "u1", total: 92.5, paymentStatus: "pending", date: "2026-07-31" },
];

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const uid = () => Math.random().toString(36).slice(2, 10);

export const db = {
  categories: {
    list: async () => (await delay(), [...categories]),
    create: async (input: Omit<Category, "id" | "createdAt">) => {
      await delay();
      const row: Category = { ...input, id: uid(), createdAt: new Date().toISOString().slice(0, 10) };
      categories = [row, ...categories];
      return row;
    },
    update: async (id: string, input: Partial<Category>) => {
      await delay();
      categories = categories.map((c) => (c.id === id ? { ...c, ...input } : c));
      return categories.find((c) => c.id === id)!;
    },
    remove: async (id: string) => {
      await delay();
      categories = categories.filter((c) => c.id !== id);
    },
  },
  products: {
    list: async () => (await delay(), [...products]),
    create: async (input: Omit<Product, "id" | "createdAt">) => {
      await delay();
      const row: Product = { ...input, id: uid(), createdAt: new Date().toISOString().slice(0, 10) };
      products = [row, ...products];
      return row;
    },
    update: async (id: string, input: Partial<Product>) => {
      await delay();
      products = products.map((p) => (p.id === id ? { ...p, ...input } : p));
      return products.find((p) => p.id === id)!;
    },
    remove: async (id: string) => {
      await delay();
      products = products.filter((p) => p.id !== id);
    },
  },
  customers: {
    list: async () => (await delay(), [...customers]),
    create: async (input: Omit<Customer, "id" | "createdAt">) => {
      await delay();
      const row: Customer = { ...input, id: uid(), createdAt: new Date().toISOString().slice(0, 10) };
      customers = [row, ...customers];
      return row;
    },
    update: async (id: string, input: Partial<Customer>) => {
      await delay();
      customers = customers.map((c) => (c.id === id ? { ...c, ...input } : c));
      return customers.find((c) => c.id === id)!;
    },
    remove: async (id: string) => {
      await delay();
      customers = customers.filter((c) => c.id !== id);
    },
  },
  sales: {
    list: async () => (await delay(), [...sales]),
  },
};

export const revenueTrend = [
  { month: "Feb", revenue: 8200, cost: 5100 },
  { month: "Mar", revenue: 10450, cost: 6300 },
  { month: "Apr", revenue: 9700, cost: 5900 },
  { month: "May", revenue: 12800, cost: 7400 },
  { month: "Jun", revenue: 14100, cost: 8250 },
  { month: "Jul", revenue: 16350, cost: 9100 },
  { month: "Aug", revenue: 18240, cost: 9950 },
];

export const salesByCategory = [
  { category: "Beverages", value: 4820 },
  { category: "Snacks", value: 3110 },
  { category: "Electronics", value: 6480 },
  { category: "Household", value: 2360 },
  { category: "Stationery", value: 1470 },
];

export const weeklyOrders = [
  { day: "Mon", orders: 24 },
  { day: "Tue", orders: 31 },
  { day: "Wed", orders: 28 },
  { day: "Thu", orders: 42 },
  { day: "Fri", orders: 51 },
  { day: "Sat", orders: 38 },
  { day: "Sun", orders: 17 },
];
