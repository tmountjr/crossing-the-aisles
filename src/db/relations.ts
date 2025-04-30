import { relations } from "drizzle-orm/relations";
import { legislators, bills, amendments, voteMeta, votes } from "./schema";

export const billsRelations = relations(bills, ({one, many}) => ({
	legislator: one(legislators, {
		fields: [bills.sponsorId],
		references: [legislators.bioguideId]
	}),
	amendments: many(amendments),
}));

export const legislatorsRelations = relations(legislators, ({many}) => ({
	bills: many(bills),
	amendments: many(amendments),
	votes: many(votes),
}));

export const amendmentsRelations = relations(amendments, ({one, many}) => ({
	bill: one(bills, {
		fields: [amendments.billId],
		references: [bills.billId]
	}),
	legislator: one(legislators, {
		fields: [amendments.sponsorId],
		references: [legislators.bioguideId]
	}),
	voteMetas: many(voteMeta),
}));

export const voteMetaRelations = relations(voteMeta, ({one, many}) => ({
	amendment: one(amendments, {
		fields: [voteMeta.amendmentId],
		references: [amendments.amendmentId]
	}),
	votes: many(votes),
}));

export const votesRelations = relations(votes, ({one}) => ({
	voteMeta: one(voteMeta, {
		fields: [votes.voteId],
		references: [voteMeta.voteId]
	}),
	legislator: one(legislators, {
		fields: [votes.legislatorId],
		references: [legislators.id]
	}),
}));