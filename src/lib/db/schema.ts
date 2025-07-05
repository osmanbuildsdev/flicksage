import { pgTable, text, timestamp, uuid, varchar, boolean, integer } from 'drizzle-orm/pg-core';


export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  avatar: text('avatar'),
  isKidsProfile: boolean('is_kids_profile').default(false),
  language: varchar('language', { length: 10 }).default('tr'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  profilePicture: text('profile_picture'),
  emailVerified: boolean('email_verified').default(false),
  activeProfileId: uuid('active_profile_id').references(() => profiles.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const watchlist = pgTable('watchlist', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  movieId: integer('movie_id').notNull(),
  movieTitle: varchar('movie_title', { length: 255 }).notNull(),
  moviePoster: text('movie_poster'),
  movieReleaseDate: varchar('movie_release_date', { length: 20 }),
  movieGenres: text('movie_genres'),
  movieOverview: text('movie_overview'),
  movieRating: varchar('movie_rating', { length: 10 }),
  status: varchar('status', { length: 20 }).notNull().default('to_watch'), // 'to_watch' or 'watched'
  addedAt: timestamp('added_at').defaultNow().notNull(),
  watchedAt: timestamp('watched_at'),
});

export const favorites = pgTable('favorites', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  movieId: integer('movie_id').notNull(),
  movieTitle: varchar('movie_title', { length: 255 }).notNull(),
  moviePoster: text('movie_poster'),
  movieReleaseDate: varchar('movie_release_date', { length: 20 }),
  movieGenres: text('movie_genres'),
  movieOverview: text('movie_overview'),
  movieRating: varchar('movie_rating', { length: 10 }),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Watchlist = typeof watchlist.$inferSelect;
export type NewWatchlist = typeof watchlist.$inferInsert;
export type Favorites = typeof favorites.$inferSelect;
export type NewFavorites = typeof favorites.$inferInsert;

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
