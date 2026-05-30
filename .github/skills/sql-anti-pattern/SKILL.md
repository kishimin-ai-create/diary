---
name: sql-anti-pattern
description: "Complete name catalog of SQL Antipatterns (2nd ed.) — 24 main patterns, 15 mini-patterns, and 2 foreign-key bonus chapters."
---

# SQL Antipatterns — Name Catalog (2nd Edition)

Source: *SQL Antipatterns, Volume 1* by Bill Karwin (supervised translation by Takuto Wada)

## Part I — Logical Design

- Jaywalking
- Naive Trees
- ID Required
- Keyless Entry
- EAV (Entity-Attribute-Value)
- Polymorphic Associations
- Multi-Column Attribute
- Metadata Tribbles

## Part II — Physical Design

- Rounding Error
- Thirty-One Flavors
- Phantom File
- Index Shotgun

## Part III — Queries

- Fear of the Unknown
- Ambiguous Groups
- Random Selection
- Poor Man's Search Engine
- Spaghetti Query
- Implicit Columns

## Part IV — Application Development

- Readable Passwords
- SQL Injection
- Pseudo-Key Neat-Freak
- See No Evil
- Diplomatic Immunity
- Standard Operating Procedure

## Mini-Antipatterns

- Split CSV column into multiple rows
- "It Works on My Computer"
- Is BIGINT Big Enough?
- Storing Prices
- Reserved Words
- Creating an Index on Every Column
- NOT IN (NULL)
- Portable SQL
- Fetching Multiple Random Rows
- Storing Hash Strings in VARCHAR
- Query Parameters Inside Quotes
- Per-Group Auto-Increment
- Reading Syntax Error Messages
- Renaming Tables/Columns
- MySQL Stored Procedures

## Part V — Foreign Key Mini-Antipatterns (Bonus)

### Standard SQL (Ch26)

- Reversing reference direction
- Referencing non-existent table
- Referencing non-unique parent column
- Defining individual constraints for composite FK
- Wrong column order in composite FK
- Data type mismatch
- Character collation mismatch
- Inserting orphaned child rows
- SET NULL on NOT NULL column
- Duplicate constraint identifiers
- Incompatible table types

### MySQL 8.0 (Ch27)

- Incompatible storage engine
- Large data type for FK column
- FK to non-unique index
- Inline reference syntax
- Default reference action misuse
- Mixing incompatible table types
