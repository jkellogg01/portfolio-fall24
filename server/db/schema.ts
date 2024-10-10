import { sqliteTable, int, text } from "drizzle-orm/sqlite-core";

export const keyTable = sqliteTable("spotify_key", {
	id: int().primaryKey(),
	accessKey: text().notNull(),
	refreshKey: text().notNull(),
	scope: text(),
	createdAt: int()
		.notNull()
		.default(Math.floor(Date.now() / 1000)),
	expiresAt: int().notNull(),
});
