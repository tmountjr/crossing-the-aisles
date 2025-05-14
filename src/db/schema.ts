import { pgTable, unique, varchar, foreignKey, timestamp, integer, pgSchema, char, primaryKey, pgView } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const siteMeta = pgSchema("site_meta");


export const legislators = pgTable("legislators", {
	bioguideId: varchar("bioguide_id").notNull(),
	lisId: varchar("lis_id"),
	id: varchar().primaryKey().notNull(),
	name: varchar().notNull(),
	termType: varchar("term_type").notNull(),
	state: varchar().notNull(),
	district: varchar().notNull(),
	party: varchar().notNull(),
	url: varchar(),
	address: varchar(),
	phone: varchar(),
	caucus: varchar().notNull(),
}, (table) => [
	unique("legislators_bioguide_id_key").on(table.bioguideId),
]);

export const bills = pgTable("bills", {
	billId: varchar("bill_id").primaryKey().notNull(),
	billType: varchar("bill_type").notNull(),
	billNumber: varchar("bill_number").notNull(),
	title: varchar().notNull(),
	shortTitle: varchar("short_title"),
	sponsorId: varchar("sponsor_id"),
	status: varchar().notNull(),
	statusAt: timestamp("status_at", { mode: 'string' }).notNull(),
	congress: varchar().notNull(),
	sourceFilename: varchar("source_filename").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.sponsorId],
			foreignColumns: [legislators.bioguideId],
			name: "bills_sponsor_id_fkey"
		}),
]);

export const amendments = pgTable("amendments", {
	amendmentId: varchar("amendment_id").primaryKey().notNull(),
	billId: varchar("bill_id"),
	sponsorId: varchar("sponsor_id"),
	chamber: varchar().notNull(),
	purpose: varchar(),
	congress: varchar().notNull(),
	sourceFilename: varchar("source_filename").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.billId],
			foreignColumns: [bills.billId],
			name: "amendments_bill_id_fkey"
		}),
	foreignKey({
			columns: [table.sponsorId],
			foreignColumns: [legislators.bioguideId],
			name: "amendments_sponsor_id_fkey"
		}),
]);

export const voteMeta = pgTable("vote_meta", {
	voteNumber: integer("vote_number").notNull(),
	voteId: varchar("vote_id").primaryKey().notNull(),
	billId: varchar("bill_id"),
	chamber: varchar().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	result: varchar().notNull(),
	category: varchar().notNull(),
	nominationTitle: varchar("nomination_title"),
	amendmentId: varchar("amendment_id"),
	sourceFilename: varchar("source_filename").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.amendmentId],
			foreignColumns: [amendments.amendmentId],
			name: "vote_meta_amendment_id_fkey"
		}),
]);

export const siteMetaInSiteMeta = siteMeta.table("site_meta", {
	lastUpdate: timestamp("last_update", { mode: 'string' }).primaryKey().notNull(),
	tz: char({ length: 500 }).notNull(),
});

export const votes = pgTable("votes", {
	voteId: varchar("vote_id").notNull(),
	legislatorId: varchar("legislator_id").notNull(),
	position: varchar().notNull(),
	originalPosition: varchar("original_position").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.voteId],
			foreignColumns: [voteMeta.voteId],
			name: "votes_vote_id_fkey"
		}),
	foreignKey({
			columns: [table.legislatorId],
			foreignColumns: [legislators.id],
			name: "votes_legislator_id_fkey"
		}),
	primaryKey({ columns: [table.voteId, table.legislatorId], name: "votes_pkey"}),
]);

export const congress = pgTable("congress", {
	congress: varchar().notNull(),
	chamber: varchar().notNull(),
	session: integer().notNull(),
	party: varchar().notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }),
}, (table) => [
	primaryKey({ columns: [table.congress, table.chamber, table.session], name: "congress_pkey"}),
]);
export const enrichedVoteMeta = pgView("enriched_vote_meta", {	voteNumber: integer("vote_number"),
	voteId: varchar("vote_id"),
	billId: varchar("bill_id"),
	chamber: varchar(),
	date: timestamp({ mode: 'string' }),
	result: varchar(),
	category: varchar(),
	nominationTitle: varchar("nomination_title"),
	amendmentId: varchar("amendment_id"),
	sourceFilename: varchar("source_filename"),
	sponsorName: varchar("sponsor_name"),
	sponsorParty: varchar("sponsor_party"),
}).as(sql`SELECT vote_meta.vote_number, vote_meta.vote_id, vote_meta.bill_id, vote_meta.chamber, vote_meta.date, vote_meta.result, vote_meta.category, vote_meta.nomination_title, vote_meta.amendment_id, vote_meta.source_filename, CASE WHEN vote_meta.amendment_id IS NOT NULL THEN a_sponsor.name ELSE b_sponsor.name END AS sponsor_name, CASE WHEN vote_meta.amendment_id IS NOT NULL AND amendments.sponsor_id IS NOT NULL THEN a_sponsor.party WHEN vote_meta.amendment_id IS NOT NULL AND amendments.sponsor_id IS NULL THEN congress.party WHEN vote_meta.category::text = ANY (ARRAY['nomination'::character varying, 'leadership'::character varying, 'quorum'::character varying, 'procedural'::character varying]::text[]) THEN congress.party WHEN vote_meta.category::text = 'cloture'::text AND vote_meta.nomination_title IS NOT NULL THEN congress.party ELSE b_sponsor.party END AS sponsor_party FROM vote_meta LEFT JOIN bills USING (bill_id) LEFT JOIN amendments USING (amendment_id) LEFT JOIN legislators a_sponsor ON amendments.sponsor_id::text = a_sponsor.bioguide_id::text LEFT JOIN legislators b_sponsor ON bills.sponsor_id::text = b_sponsor.bioguide_id::text LEFT JOIN congress ON vote_meta.chamber::text = congress.chamber::text AND vote_meta.date >= congress.start_date AND vote_meta.date <= COALESCE(congress.end_date, '9999-12-31 00:00:00'::timestamp without time zone) ORDER BY vote_meta.chamber, vote_meta.vote_number`);

export const latestVoteIds = pgView("latest_vote_ids", {	voteNumber: integer("vote_number"),
	voteId: varchar("vote_id"),
	billId: varchar("bill_id"),
	chamber: varchar(),
	date: timestamp({ mode: 'string' }),
	result: varchar(),
	category: varchar(),
	nominationTitle: varchar("nomination_title"),
	sourceFilename: varchar("source_filename"),
	uniqueMatchingField: varchar("unique_matching_field"),
}).as(sql`WITH temp_vm AS ( SELECT vm_1.vote_number, vm_1.vote_id, vm_1.bill_id, vm_1.chamber, vm_1.date, vm_1.result, vm_1.category, vm_1.nomination_title, vm_1.source_filename, CASE WHEN vm_1.bill_id IS NULL THEN SUBSTRING(vm_1.nomination_title FROM 1 FOR 10)::character varying ELSE vm_1.bill_id END AS unique_matching_field FROM vote_meta vm_1 ) SELECT vm.vote_number, vm.vote_id, vm.bill_id, vm.chamber, vm.date, vm.result, vm.category, vm.nomination_title, vm.source_filename, vm.unique_matching_field FROM temp_vm vm JOIN ( SELECT temp_vm.unique_matching_field, max(temp_vm.date) AS latest_date FROM temp_vm GROUP BY temp_vm.unique_matching_field) latest_votes ON vm.unique_matching_field::text = latest_votes.unique_matching_field::text AND vm.date = latest_votes.latest_date`);