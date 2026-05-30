---
name: sql-anti-pattern
description: "Complete catalog of SQL Antipatterns (2nd ed.) — 24 main antipatterns across 4 parts, plus 15 mini-antipatterns and 2 foreign-key bonus chapters."
---

# SQL Antipatterns — Complete Catalog (2nd Edition)

Source: *SQL Antipatterns, Volume 1* by Bill Karwin (supervised translation by Takuto Wada)  
Structure: 27 chapters = Part I (logical design) + II (physical design) + III (queries) + IV (application) + V (foreign key mini-patterns)

---

## Part I — Logical Design Antipatterns

### Ch2: Jaywalking
Store multi-valued data as comma-separated values in a single column.
- ❌ `products = "apples,bananas,cherries"` — can't JOIN, can't index, regex hacks required
- ✅ Use an intersection table (many-to-many)

> **Mini-antipattern: Split CSV column into multiple rows**  
> Exploding CSV values into rows at query time is a workaround, not a fix. Normalize the schema.

### Ch3: Naive Trees
Represent hierarchical data with an adjacency list (only `parent_id`) and rely on recursive queries for every traversal.
- ❌ Deleting a subtree requires loading the whole tree in application code
- ✅ Alternatives by use case: Path Enumeration, Nested Sets, Closure Table

> **Mini-antipattern: "It Works on My Computer"**  
> Recursive CTEs behave differently across DB versions and settings. Pin your DB version; test on the target environment.

### Ch4: ID Required
Always add a surrogate `id BIGINT AUTO_INCREMENT PRIMARY KEY` — even when a natural key already exists or a composite key would be better.
- ❌ Duplicates are silently allowed when the real uniqueness constraint is absent
- ✅ Use the minimal natural key; add a surrogate only when genuinely needed

> **Mini-antipattern: Is BIGINT Big Enough?**  
> 2^63 rows is practically unlimited, but if you start IDs at 1 and delete rows heavily, gaps grow. Don't worry about running out — worry about gaps causing confusion.

### Ch5: Keyless Entry
Omit foreign key constraints to "keep it simple" or improve insert speed.
- ❌ Orphaned rows accumulate silently; referential integrity relies entirely on application logic
- ✅ Always declare FK constraints; rely on `ON DELETE` / `ON UPDATE` actions

### Ch6: EAV (Entity-Attribute-Value)
Store arbitrary attributes as rows in a generic `(entity_id, attr_name, attr_value TEXT)` table.
- ❌ No type safety, no NOT NULL, no FK, queries become unmaintainable
- ✅ Single-Table Inheritance, Class Table Inheritance, or JSON columns (with schema validation)

### Ch7: Polymorphic Associations
Use a `(parent_id, parent_type)` pair as a "pseudo foreign key" pointing to multiple tables.
- ❌ Cannot declare a real FK; DB cannot enforce referential integrity
- ✅ Use an exclusive arc (one nullable FK per possible parent) or a common supertype table

### Ch8: Multi-Column Attribute
Store multiple values of the same kind in separate columns: `tag1`, `tag2`, `tag3`.
- ❌ Searching requires `OR` across all columns; adding a 4th tag requires a schema change
- ✅ Use an intersection table (same fix as Jaywalking)

> **Mini-antipattern: Storing Prices**  
> Never store monetary values in `FLOAT`/`DOUBLE`. Use `DECIMAL(precision, scale)` or store as integer cents.

### Ch9: Metadata Tribbles
Replicate tables or columns to partition data (e.g., `orders_2023`, `orders_2024`, or `month_1` … `month_12`).
- ❌ Cross-partition queries require `UNION ALL`; schema maintenance explodes
- ✅ Add a discriminator column and partition at the storage level (DB partitioning feature)

---

## Part II — Physical Design Antipatterns

### Ch10: Rounding Error
Use `FLOAT` or `DOUBLE` for monetary or other exact-decimal values.
- ❌ `0.1 + 0.2 ≠ 0.3` in IEEE 754
- ✅ Use `DECIMAL(m, d)` for money; use integer arithmetic (store cents)

### Ch11: Thirty-One Flavors
Store constrained values (enums) as unconstrained `VARCHAR` — any string is accepted.
- ❌ Typos and legacy values accumulate; enforcing the set requires application-level checks
- ✅ Use a `CHECK` constraint, a proper `ENUM` type, or a lookup/reference table

> **Mini-antipattern: Reserved Words**  
> Column/table names that are SQL reserved words (`date`, `order`, `user`) require quoting everywhere. Choose non-reserved names.

### Ch12: Phantom File
Store file contents as a filesystem path in a `VARCHAR` column, assuming the file will always exist.
- ❌ Files can be deleted or moved independently of DB rows; no transactional guarantee
- ✅ Store BLOBs in DB for transactional safety, or use object storage (S3) with a health-check job

### Ch13: Index Shotgun
Add indexes blindly (on every column, or on no columns) without measuring query patterns.
- ❌ Too many indexes slow writes; too few slow reads; unused indexes waste space
- ✅ Profile slow queries first; create covering indexes for the measured hot paths

> **Mini-antipattern: Creating an Index on Every Column**  
> A table with 20 columns and 20 single-column indexes is not "safe". Composite indexes and selectivity analysis are required.

---

## Part III — Query Antipatterns

### Ch14: Fear of the Unknown
Mishandle `NULL` by comparing with `=` / `!=` instead of `IS NULL` / `IS NOT NULL`.
- ❌ `WHERE col != 'foo'` silently excludes `NULL` rows
- ✅ Use `IS NULL`, `IS NOT NULL`, `COALESCE()`, `NULLIF()`; understand three-valued logic

> **Mini-antipattern: NOT IN (NULL)**  
> `WHERE id NOT IN (SELECT parent_id FROM t)` returns zero rows when any `parent_id` is NULL. Use `NOT EXISTS` or filter NULLs in the subquery.

### Ch15: Ambiguous Groups
Use `GROUP BY` without including all non-aggregated `SELECT` columns (MySQL's legacy lenient mode silently picks arbitrary values).
- ❌ `SELECT name, MAX(price) FROM products GROUP BY category` — `name` is undefined
- ✅ Include all non-aggregate columns in `GROUP BY`, or use window functions

> **Mini-antipattern: Portable SQL**  
> Relying on vendor-specific GROUP BY leniency is not portable. Write ANSI-compliant SQL.

### Ch16: Random Selection
Fetch a random row with `ORDER BY RAND() LIMIT 1`.
- ❌ Sorts the entire table before limiting; O(n) for every call
- ✅ Use `WHERE id >= (RAND() * MAX(id))` trick, or maintain a separate random-order column

> **Mini-antipattern: Fetching Multiple Random Rows**  
> `LIMIT k` with `ORDER BY RAND()` is O(n log n). Use offset-based or reservoir-sampling approaches at scale.

### Ch17: Poor Man's Search Engine
Implement full-text search with `LIKE '%keyword%'` predicates.
- ❌ Cannot use a B-tree index; full-table scan on every search
- ✅ Use the DB's full-text index (MySQL FULLTEXT, PostgreSQL `tsvector`) or an external engine (Elasticsearch, OpenSearch)

### Ch18: Spaghetti Query
Solve a complex problem in a single massive SQL query (with multiple self-joins, subqueries, Cartesian products).
- ❌ Accidental Cartesian products inflate row counts; query is unmaintainable
- ✅ Break into multiple focused queries; use CTEs for readability

### Ch19: Implicit Columns
Write `SELECT *` or `INSERT INTO t VALUES (...)` without naming columns.
- ❌ Schema changes silently break queries; over-fetches data; breaks INSERT on column reorder
- ✅ Always name every column explicitly

---

## Part IV — Application Development Antipatterns

### Ch20: Readable Passwords
Store passwords in plaintext (or with reversible encryption).
- ❌ A DB breach exposes all user credentials immediately
- ✅ Store a salted hash using bcrypt, Argon2, or scrypt; never store the original password

> **Mini-antipattern: Storing Hash Strings in VARCHAR**  
> If the hash algorithm is known, use `CHAR(n)` (fixed length, e.g., `CHAR(64)` for SHA-256). If unknown or variable, use `VARCHAR(255)`.

### Ch21: SQL Injection
Build SQL strings by concatenating unvalidated user input.
- ❌ `"SELECT * FROM users WHERE name = '" + input + "'"` — classic injection vector
- ✅ Use parameterized queries / prepared statements; use an ORM; validate input type/range

> **Mini-antipattern: Query Parameters Inside Quotes**  
> `LIKE '%?%'` treats `?` as a literal character, not a placeholder. Use `LIKE CONCAT('%', ?, '%')` instead.

### Ch22: Pseudo-Key Neat-Freak
Fill gaps in auto-increment primary keys after deletions to keep sequences gapless.
- ❌ Requires locking; breaks references that cached the old IDs
- ✅ PKs only need to be unique, not sequential. Gaps are normal and harmless.

> **Mini-antipattern: Per-Group Auto-Increment**  
> Simulating per-group sequential IDs at insert time causes race conditions. Use `ROW_NUMBER() OVER (PARTITION BY ...)` at query time instead.

### Ch23: See No Evil
Ignore return values, error codes, and exceptions from DB calls.
- ❌ A failed INSERT silently discards data; the application continues with wrong state
- ✅ Always check return values and catch exceptions; log the actual constructed SQL when debugging

> **Mini-antipattern: Reading Syntax Error Messages**  
> DB error messages (especially Oracle's) are cryptic but contain the critical clue. Read them carefully; they indicate the position of the error.

### Ch24: Diplomatic Immunity
Exempt database code (DDL, stored procedures, migrations) from the same QA standards applied to application code.
- ❌ No tests, no version control, no documentation for DB schema = fragile, undocumented system
- ✅ Version-control all migrations; write DB unit tests; document schema decisions

> **Mini-antipattern: Renaming Tables/Columns**  
> Renaming live tables causes downtime. Strategy: create the new name, migrate code gradually, drop the old name once all references are updated. Or use a view as a temporary alias.

### Ch25: Standard Operating Procedure *(new in 2nd ed.)*
Continue using an obsolete technology stack solely because "that's how we've always done it."
- ❌ Legacy stored-procedure-heavy designs, outdated ORM patterns, MySQL 5.x assumptions
- ✅ Periodically reassess the stack; adopt modern architecture (ORMs, migrations, connection pooling)

> **Mini-antipattern: MySQL Stored Procedures**  
> MySQL stored procedures have limited tooling for packaging, debugging, testing, and deployment. Understand the constraints before adopting them at scale.

---

## Part V — Foreign Key Mini-Antipatterns *(bonus, new in 2nd ed.)*

### Ch26: Wrong Use of Foreign Keys in Standard SQL

Common mistakes with FK constraints per ANSI SQL:
1. Reversing the reference direction (child → parent, not parent → child)
2. Referencing a table that doesn't exist yet at DDL time
3. Referencing a non-primary-key / non-unique column of the parent
4. Defining individual constraints after a composite FK instead of a single composite constraint
5. Defining FK columns in the wrong order relative to the referenced composite key
6. Data type mismatch between FK and referenced column
7. Character collation mismatch between FK and referenced column
8. Inserting child rows before the parent row exists (creating orphans)
9. Using `SET NULL` action on a `NOT NULL` column
10. Duplicate constraint identifiers within the same schema
11. Using incompatible table types (storage engines) for parent and child

### Ch27: Wrong Use of Foreign Keys in MySQL 8.0

MySQL-specific FK pitfalls:
1. Using an incompatible storage engine (only InnoDB supports FKs; MyISAM ignores them)
2. Using a large data type for the FK column (e.g., `TEXT` or `BLOB` — not supported)
3. Defining an FK to a non-unique index on the parent
4. Using inline reference syntax (FK defined inline on the column — silently ignored in older MySQL)
5. Relying on the default reference action (`RESTRICT`) without understanding its behavior
6. Mixing incompatible table types in the same FK relationship

---

## Quick Reference

| # | Antipattern | Root Cause |
|---|---|---|
| 2 | Jaywalking | CSV in a column |
| 3 | Naive Trees | Adjacency list only |
| 4 | ID Required | Surrogate key always |
| 5 | Keyless Entry | No FK constraints |
| 6 | EAV | Generic attribute table |
| 7 | Polymorphic Associations | Fake multi-target FK |
| 8 | Multi-Column Attribute | tag1/tag2/tag3 columns |
| 9 | Metadata Tribbles | Table/column proliferation |
| 10 | Rounding Error | FLOAT for money |
| 11 | Thirty-One Flavors | Unconstrained VARCHAR enum |
| 12 | Phantom File | Filesystem path in DB |
| 13 | Index Shotgun | Blind index creation |
| 14 | Fear of the Unknown | NULL mishandling |
| 15 | Ambiguous Groups | Invalid GROUP BY |
| 16 | Random Selection | ORDER BY RAND() |
| 17 | Poor Man's Search Engine | LIKE '%word%' |
| 18 | Spaghetti Query | One giant SQL |
| 19 | Implicit Columns | SELECT * |
| 20 | Readable Passwords | Plaintext passwords |
| 21 | SQL Injection | String concatenation |
| 22 | Pseudo-Key Neat-Freak | Filling ID gaps |
| 23 | See No Evil | Ignoring errors |
| 24 | Diplomatic Immunity | DB exempt from QA |
| 25 | Standard Operating Procedure | Legacy tech inertia |
