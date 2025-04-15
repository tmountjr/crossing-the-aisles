import { InferSelectModel, sql } from "drizzle-orm";
import { sqliteTable, sqliteView, text, numeric, primaryKey, integer } from "drizzle-orm/sqlite-core"

export const legislators = sqliteTable("legislators", {
	bioguideId: text("bioguide_id"),
	lisId: text("lis_id"),
	id: text().primaryKey().notNull(),
	name: text(),
	termType: text("term_type"),
	state: text(),
	district: text(),
	party: text().notNull(),
	url: text(),
	address: text(),
	phone: text(),
});

export const bills = sqliteTable("bills", {
	billId: text("bill_id").primaryKey().notNull(),
	billType: text("bill_type"),
	billNumber: text("bill_number"),
	title: text(),
	shortTitle: text("short_title"),
	sponsorId: text("sponsor_id").references(() => legislators.bioguideId),
	status: text(),
	statusAt: numeric("status_at"),
	congress: text(),
	sourceFilename: text("source_filename"),
});

export const votes = sqliteTable("votes", {
	voteId: text("vote_id").notNull().references(() => voteMeta.voteId),
	legislatorId: text("legislator_id").notNull().references(() => legislators.id),
	position: text(),
	originalPosition: text("original_position"),
},
	(table) => [
		primaryKey({ columns: [table.voteId, table.legislatorId], name: "votes_vote_id_legislator_id_pk" })
	]);

export const voteMeta = sqliteTable("vote_meta", {
	voteNumber: integer("vote_number"),
	voteId: text("vote_id").primaryKey().notNull(),
	billId: text("bill_id").references(() => bills.billId),
	chamber: text(),
	date: numeric(),
	result: text(),
	category: text(),
	nominationTitle: text("nomination_title"),
	sourceFilename: text("source_filename"),
});

export const latestVoteIds = sqliteView("latest_vote_ids", {
	voteNumber: integer("vote_number"),
	voteId: text("vote_id").primaryKey().notNull(),
	billId: text("bill_id").references(() => bills.billId),
	chamber: text(),
	date: numeric(),
	result: text(),
	category: text(),
	nominationTitle: text("nomination_title"),
	sourceFilename: text("source_filename"),
}).as(
	sql`
	with temp_vm as (
		select
			*,
			case
				when bill_id = 'N/A'
				then substr(nomination_title, 1, 10)
				else bill_id
			end as unique_matching_field
		from vote_meta vm
	)

	select vm.*
	from temp_vm vm
	join (
		select unique_matching_field, max(date) as latest_date
		from temp_vm
		group by unique_matching_field
	) latest_votes
	on vm.unique_matching_field = latest_votes.unique_matching_field and vm.date = latest_votes.latest_date
	`)

type VoteMeta = InferSelectModel<typeof voteMeta>;
export type LatestVoteId = VoteMeta & { "uniqueMatchingField": string };

export const enrichedVoteMeta = sqliteView("enriched_vote_meta", {
	voteNumber: integer("vote_number"),
	voteId: text("vote_id").primaryKey().notNull(),
	billId: text("bill_id").references(() => bills.billId),
	chamber: text(),
	date: numeric(),
	result: text(),
	category: text(),
	nominationTitle: text("nomination_title"),
	sourceFilename: text("source_filename"),
	sponsorName: text("sponsor_name"),
	sponsorParty: text("sponsor_party")
}).as(sql`
  select vote_meta.*, legislators.name as sponsor_name, legislators.party as sponsor_party
  from vote_meta
  left join bills on vote_meta.bill_id = bills.bill_id
  left join legislators on bills.sponsor_id = legislators.bioguide_id
	`)