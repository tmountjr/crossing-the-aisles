import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: ".env.local" })

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  schemaFilter: ['public', 'site_meta'],
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
