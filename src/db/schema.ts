import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  setName: text("set_name"),
  kind: text("kind").notNull().default("pack"), // 'box' | 'pack'
  price: integer("price").notNull(), // in ILS ₪
  compareAt: integer("compare_at"),
  image: text("image").notNull(),
  description: text("description"),
  badge: text("badge"), // חדש / חם / נדיר ...
  stock: integer("stock").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const claims = pgTable(
  "claims",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    image: text("image").notNull(),
    startPrice: integer("start_price").notNull(),
    minIncrement: integer("min_increment").notNull().default(10),
    currentBid: integer("current_bid").notNull().default(0),
    currentBidder: text("current_bidder"),
    bidsCount: integer("bids_count").notNull().default(0),
    status: text("status").notNull().default("live"), // 'live' | 'closed'
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("claims_status_idx").on(t.status)],
);

export const bids = pgTable(
  "bids",
  {
    id: serial("id").primaryKey(),
    claimId: integer("claim_id")
      .notNull()
      .references(() => claims.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    amount: integer("amount").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("bids_claim_idx").on(t.claimId)],
);

export type OrderItem = {
  id: number;
  name: string;
  kind: string;
  price: number;
  qty: number;
};

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  note: text("note"),
  channel: text("channel").notNull(), // 'whatsapp' | 'sms'
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("new"), // new | confirmed | shipped | done
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Durable, DB-backed copy of the site's image assets (base64).
 * Lets /api/img serve images even on deployments missing /public files.
 */
export const media = pgTable("media", {
  name: text("name").primaryKey(), // e.g. "logo.jpg" or "products/box-gold.jpg"
  contentType: text("content_type").notNull(),
  data: text("data").notNull(), // base64
});

/** Simple key-value flags (e.g. one-time seeding). */
export const appMeta = pgTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type Product = typeof products.$inferSelect;
export type Claim = typeof claims.$inferSelect;
export type Bid = typeof bids.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type MediaFile = typeof media.$inferSelect;
export type AppMeta = typeof appMeta.$inferSelect;
