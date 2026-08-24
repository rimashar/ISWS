#!/usr/bin/env node
/**
 * Prints the officials auth migration SQL for Supabase Dashboard → SQL Editor.
 * Run: node scripts/apply-auth-migration.mjs
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationPath = join(__dirname, '../supabase/migrations/20260824145900_create_officials_auth.sql');
const sql = readFileSync(migrationPath, 'utf8');

console.log('Paste this into Supabase Dashboard → SQL Editor → Run:\n');
console.log(sql);
