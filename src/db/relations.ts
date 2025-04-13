import { relations } from "drizzle-orm/relations";
import { legislators, bills, votes, voteMeta } from "./schema";

export const billsRelations = relations(bills, ({one, many}) => ({
	legislator: one(legislators, {
		fields: [bills.sponsorId],
		references: [legislators.bioguideId]
	}),
	voteMetas: many(voteMeta),
}));

export const legislatorsRelations = relations(legislators, ({many}) => ({
	bills: many(bills),
	votes: many(votes),
}));

export const votesRelations = relations(votes, ({one}) => ({
	legislator: one(legislators, {
		fields: [votes.legislatorId],
		references: [legislators.id]
	}),
	voteMeta: one(voteMeta, {
		fields: [votes.voteId],
		references: [voteMeta.voteId]
	}),
}));

export const voteMetaRelations = relations(voteMeta, ({one, many}) => ({
	votes: many(votes),
	bill: one(bills, {
		fields: [voteMeta.billId],
		references: [bills.billId]
	}),
}));