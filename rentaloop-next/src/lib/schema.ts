import { pgTable, uuid, text, timestamp, integer, date, boolean, real, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { AdapterAccount } from "next-auth/adapters"

// --- Auth.js Tables ---

export const users = pgTable("user", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    // Custom fields merged from old profiles
    role: text('role').default('basic'),
    kycStatus: text('kyc_status').default('none'),
    kycImageUrl: text('kyc_image_url'),
    rating: real('rating').default(0),
    reviewCount: integer('review_count').default(0),
    isBlocked: boolean('is_blocked').default(false),
    adminNotes: text('admin_notes'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const userProfiles = pgTable('user_profiles', {
    userId: text('user_id')
        .primaryKey()
        .references(() => users.id, { onDelete: 'cascade' }),

    realName: text('real_name'),
    lineId: text('line_id'),
    phone: text('phone'),

    city: text('city'),
    district: text('district'),
    address: text('address'),

    hostStatus: text('host_status').default('none'),
    hostCity: text('host_city'),
    hostDistrict: text('host_district'),

    kycIdFrontUrl: text('kyc_id_front_url'),
    kycIdBackUrl: text('kyc_id_back_url'),

    hostRulesAccepted: boolean('host_rules_accepted').default(false),
    hostRulesAcceptedAt: timestamp('host_rules_accepted_at', { mode: 'date' }),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccount["type"]>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
);

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
);

// --- Application Tables ---

// Deprecated: profiles (Use 'users' instead)
// We keep references in code but we should migrate them.
// For now, let's assume we migrated everything to 'users'.

export const categories = pgTable('categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    parentId: uuid('parent_id'),
    level: integer('level'),
    slug: text('slug').unique(),
});

export const items = pgTable('items', {
    id: uuid('id').defaultRandom().primaryKey(),
    ownerId: text('owner_id').references(() => users.id).notNull(), // Changed from uuid to text to match users.id
    categoryId: uuid('category_id').references(() => categories.id),
    title: text('title').notNull(),
    description: text('description'),
    pricePerDay: integer('price_per_day'),
    deposit: integer('deposit'),
    images: text('images').array(),
    pickupLocation: text('pickup_location'), // Legacy single location (string)
    pickupLocations: json('pickup_locations'), // New: Array of { placeId, name, address, lat, lng }
    availableFrom: timestamp('available_from'),
    availableTo: timestamp('available_to'),
    status: text('status').default('active'),

    // New Fields
    discountRate3Days: integer('discount_rate_3_days').default(0), // Percentage off (e.g. 10 = 10% off)
    discountRate7Days: integer('discount_rate_7_days').default(0),
    condition: text('condition').default('good'),
    notes: text('notes'), // Could be JSON or newline separated string

    createdAt: timestamp('created_at').defaultNow(),
});

export const rentals = pgTable('rentals', {
    id: uuid('id').defaultRandom().primaryKey(),
    itemId: uuid('item_id').references(() => items.id).notNull(),
    renterId: text('renter_id').references(() => users.id).notNull(),
    ownerId: text('owner_id').references(() => users.id).notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    totalDays: integer('total_days').notNull(),
    totalAmount: integer('total_amount').notNull(),
    status: text('status').default('pending'),
    rejectionReason: text('rejection_reason'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const itemQuestions = pgTable('item_questions', {
    id: uuid('id').defaultRandom().primaryKey(),
    itemId: uuid('item_id').references(() => items.id).notNull(),
    userId: text('user_id').references(() => users.id).notNull(),
    content: text('content').notNull(),
    reply: text('reply'),
    repliedAt: timestamp('replied_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const reviews = pgTable('reviews', {
    id: uuid('id').defaultRandom().primaryKey(),
    rentalId: uuid('rental_id').references(() => rentals.id).notNull(),
    reviewerId: text('reviewer_id').references(() => users.id).notNull(),
    revieweeId: text('reviewee_id').references(() => users.id).notNull(),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    isVisible: boolean('is_visible').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

export const convenienceStores = pgTable('convenience_stores', {
    id: uuid('id').defaultRandom().primaryKey(),
    brand: text('brand').notNull(),
    name: text('name').notNull(),
    address: text('address').notNull(),
    city: text('city').notNull(),
    district: text('district').notNull(),
    lat: real('lat'),
    lng: real('lng'),
});

export const rentalMessages = pgTable('rental_messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    rentalId: uuid('rental_id').references(() => rentals.id, { onDelete: 'cascade' }).notNull(),
    senderId: text('sender_id').references(() => users.id).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const rentalsRelations = relations(rentals, ({ one, many }) => ({
    item: one(items, { fields: [rentals.itemId], references: [items.id] }),
    renter: one(users, { fields: [rentals.renterId], references: [users.id], relationName: 'renter' }),
    owner: one(users, { fields: [rentals.ownerId], references: [users.id], relationName: 'owner' }),
    messages: many(rentalMessages),
}));

export const rentalMessagesRelations = relations(rentalMessages, ({ one }) => ({
    rental: one(rentals, { fields: [rentalMessages.rentalId], references: [rentals.id] }),
    sender: one(users, { fields: [rentalMessages.senderId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
    profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
    items: many(items),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
    user: one(users, { fields: [userProfiles.userId], references: [users.id] }),
}));

export const emailTemplates = pgTable('email_templates', {
    key: text('key').primaryKey(), // e.g., 'register_success'
    subject: text('subject').notNull(),
    body: text('body').notNull(), // HTML content
    description: text('description'),
    variables: text('variables'), // JSON string or comma-separated list of available variables
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Site settings table for banners, titles, etc.
// Site settings table for banners, titles, etc.
import { json } from 'drizzle-orm/pg-core'; // Need to import json type

export const siteSettings = pgTable('site_settings', {
    key: text('key').primaryKey(), // e.g., 'home_banner', 'products_banner'
    imageUrl: text('image_url'),
    title: text('title'),
    subtitle: text('subtitle'),
    tagText: text('tag_text'),
    styles: json('styles'), // For storing colors, sizes, etc. { title: { color, size }, subtitle: { color, size }, tag: { color, bg, size } }
    updatedAt: timestamp('updated_at').defaultNow(),
});
