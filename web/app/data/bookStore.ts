import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { config } from "dotenv";
import { Pool } from "pg";
import { buildBookCatalog, BookRecord, seedBookRecords } from "./bookCatalog";

config({ path: resolve(process.cwd(), "../server/.env") });
config();

const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: connectionString.includes("localhost")
        ? false
        : {
            rejectUnauthorized: false
          }
    })
  : null;

let initialized = false;

export type BookInput = {
  category: string;
  content: string;
  id?: string;
  title: string;
};

const defaultCategories = ["圣经", "英语", "新闻", "AI"];

export async function listBooks() {
  if (!pool) {
    return seedBookRecords;
  }

  await initBookDb();

  const result = await pool.query<{
    category: string;
    content: string;
    created_at: Date;
    id: string;
    slug: string;
    title: string;
    updated_at: Date;
  }>(`
    select id, slug, title, category, content, created_at, updated_at
    from koala_study_books
    order by category_order(category), title asc
  `);

  return result.rows.map((row) => ({
    path: row.slug,
    content: {
      id: row.id,
      title: row.title,
      category: row.category,
      content: row.content,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString()
    }
  }));
}

export async function listBookCategories() {
  if (!pool) {
    return defaultCategories;
  }

  await initBookDb();

  const result = await pool.query<{ name: string }>(`
    select name
    from koala_study_book_categories
    order by sort_order asc, name asc
  `);

  return result.rows.map((row) => row.name);
}

export async function createBookCategory(name: string) {
  if (!pool) {
    throw new Error("DATABASE_URL is required to create Books categories.");
  }

  await initBookDb();

  const trimmedName = name.trim();
  const result = await pool.query<{ name: string }>(
    `
      insert into koala_study_book_categories (name, sort_order)
      values ($1, 99)
      on conflict (name) do update set name = excluded.name
      returning name
    `,
    [trimmedName]
  );

  return result.rows[0].name;
}

export async function getBookCatalog() {
  return buildBookCatalog(await listBooks());
}

export async function findBookByPath(path: string) {
  const normalizedPath = decodeURIComponent(path).replace(/^\/+/, "");

  if (!pool) {
    return seedBookRecords.find((record) => record.path === normalizedPath)?.content ?? null;
  }

  await initBookDb();

  const result = await pool.query<{
    category: string;
    content: string;
    created_at: Date;
    id: string;
    title: string;
    updated_at: Date;
  }>(
    `
      select id, title, category, content, created_at, updated_at
      from koala_study_books
      where slug = $1
      limit 1
    `,
    [normalizedPath]
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

export async function createBook(input: BookInput) {
  if (!pool) {
    throw new Error("DATABASE_URL is required to create Books content.");
  }

  await initBookDb();

  const now = new Date();
  const id = input.id?.trim() || randomUUID().toUpperCase();
  const title = input.title.trim();
  const category = input.category.trim();
  const slug = `${categorySlug(category)}/${slugify(title)}.json`;

  await pool.query(
    `
      insert into koala_study_book_categories (name, sort_order)
      values ($1, 99)
      on conflict (name) do nothing
    `,
    [category]
  );

  const result = await pool.query<{
    category: string;
    content: string;
    created_at: Date;
    id: string;
    slug: string;
    title: string;
    updated_at: Date;
  }>(
    `
      insert into koala_study_books (id, slug, title, category, content, created_at, updated_at)
      values ($1, $2, $3, $4, $5, $6, $6)
      on conflict (id) do update set
        slug = excluded.slug,
        title = excluded.title,
        category = excluded.category,
        content = excluded.content,
        updated_at = excluded.updated_at
      returning id, slug, title, category, content, created_at, updated_at
    `,
    [id, slug, title, category, input.content.trim(), now]
  );

  const row = result.rows[0];

  return {
    path: row.slug,
    content: {
      id: row.id,
      title: row.title,
      category: row.category,
      content: row.content,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString()
    }
  } satisfies BookRecord;
}

async function initBookDb() {
  if (!pool || initialized) {
    return;
  }

  await pool.query(`
    create table if not exists koala_study_book_categories (
      name text primary key,
      sort_order integer not null default 99,
      created_at timestamptz not null default now()
    );

    create table if not exists koala_study_books (
      id text primary key,
      slug text not null unique,
      title text not null,
      category text not null,
      content text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create index if not exists koala_study_books_category_idx on koala_study_books(category);

    create or replace function category_order(category_name text)
    returns integer
    language sql
    immutable
    as $$
      select case category_name
        when '圣经' then 1
        when '英语' then 2
        when '新闻' then 3
        when 'AI' then 4
        else 99
      end
    $$;
  `);

  for (let index = 0; index < defaultCategories.length; index += 1) {
    const category = defaultCategories[index];

    await pool.query(
      `
        insert into koala_study_book_categories (name, sort_order)
        values ($1, $2)
        on conflict (name) do update set sort_order = least(koala_study_book_categories.sort_order, excluded.sort_order)
      `,
      [category, index + 1]
    );
  }

  for (const record of seedBookRecords) {
    await pool.query(
      `
        insert into koala_study_book_categories (name, sort_order)
        values ($1, 99)
        on conflict (name) do nothing
      `,
      [record.content.category]
    );

    await pool.query(
      `
        insert into koala_study_books (id, slug, title, category, content, created_at, updated_at)
        values ($1, $2, $3, $4, $5, $6, $7)
        on conflict (id) do nothing
      `,
      [
        record.content.id,
        record.path,
        record.content.title,
        record.content.category,
        record.content.content,
        record.content.createdAt,
        record.content.updatedAt
      ]
    );
  }

  initialized = true;
}

function categorySlug(category: string) {
  const known: Record<string, string> = {
    AI: "ai",
    圣经: "bible",
    新闻: "news",
    英语: "english"
  };

  return known[category] ?? slugify(category);
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || randomUUID();
}
