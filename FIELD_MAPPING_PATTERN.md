# Field Mapping Pattern (snake_case → camelCase)

## The Issue

**PostgreSQL uses snake_case:**
- `created_at`
- `updated_at`
- `thumbnail_url`
- `is_expert_answer`

**GraphQL expects camelCase:**
- `createdAt`
- `updatedAt`
- `thumbnailUrl`
- `isExpertAnswer`

## The Solution: Field Resolvers

Add field resolvers to map database column names to GraphQL field names.

---

## Pattern for All Types

```typescript
// apps/api/src/graphql/resolvers/[type].ts

export const [type]Resolvers = {
  Query: {
    // ... queries
  },

  Mutation: {
    // ... mutations
  },

  [TypeName]: {
    // Map snake_case to camelCase
    createdAt(parent: any) {
      return parent.created_at;
    },

    updatedAt(parent: any) {
      return parent.updated_at;
    },

    // Any other snake_case fields...

    // Then your other resolvers...
    async relatedField(parent: any, _: any, { db }: Context) {
      // ...
    },
  },
};
```

---

## Applied Fixes

### ✅ Video Type (`video.ts`)
```typescript
Video: {
  status(parent: any) {
    return parent.status.toUpperCase(); // Also uppercase enum
  },

  createdAt(parent: any) {
    return parent.created_at;
  },

  updatedAt(parent: any) {
    return parent.updated_at;
  },

  thumbnailUrl(parent: any) {
    return parent.thumbnail_url;
  },

  manifestUrl(parent: any) {
    return parent.manifest_url;
  },

  async creator(parent: any, _: any, { db }: Context) {
    // Fetch creator...
  },
}
```

### ✅ Thread Type (`forum.ts`)
```typescript
Thread: {
  createdAt(parent: any) {
    return parent.created_at;
  },

  updatedAt(parent: any) {
    return parent.updated_at;
  },

  async creator(parent: any, _: any, { db }: Context) {
    // Fetch creator...
  },

  async posts(parent: any, _: any, { db }: Context) {
    // Fetch posts...
  },
}
```

### ✅ Post Type (`forum.ts`)
```typescript
Post: {
  createdAt(parent: any) {
    return parent.created_at;
  },

  updatedAt(parent: any) {
    return parent.updated_at;
  },

  isExpertAnswer(parent: any) {
    return parent.is_expert_answer;
  },

  async thread(parent: any, _: any, { db }: Context) {
    // Fetch thread...
  },

  async author(parent: any, _: any, { db }: Context) {
    // Fetch author...
  },
}
```

---

## Why This Happens

1. **Database Convention:** PostgreSQL traditionally uses `snake_case` for column names
2. **JavaScript Convention:** JavaScript/TypeScript uses `camelCase` for object properties
3. **GraphQL Convention:** GraphQL follows JavaScript conventions (camelCase)
4. **The Gap:** GraphQL type system needs the data in camelCase, but the database returns snake_case

---

## How Field Resolvers Work

```typescript
// When GraphQL sees this query:
{
  thread(id: "123") {
    createdAt  // ← GraphQL field (camelCase)
  }
}

// It calls the resolver:
Thread: {
  createdAt(parent) {
    return parent.created_at  // ← Database column (snake_case)
  }
}

// Where parent = { created_at: "2025-10-10T...", ... }
// Returns: "2025-10-10T..."
```

---

## Common Fields to Map

| Database (snake_case) | GraphQL (camelCase) |
|-----------------------|---------------------|
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |
| `creator_id` | `creatorId` (handled by resolver) |
| `author_id` | `authorId` (handled by resolver) |
| `thumbnail_url` | `thumbnailUrl` |
| `manifest_url` | `manifestUrl` |
| `is_expert_answer` | `isExpertAnswer` |
| `post_count` | `postCount` |
| `password_hash` | (never expose to GraphQL) |

---

## Alternative Solution: Use Aliases in SQL

Instead of field resolvers, you could alias in SQL:

```typescript
// Option 1: Field Resolvers (CURRENT APPROACH)
const result = await db.query('SELECT created_at FROM videos WHERE id = $1', [id]);
// Then add field resolver: createdAt(parent) { return parent.created_at; }

// Option 2: SQL Aliases (NOT RECOMMENDED - less flexible)
const result = await db.query('SELECT created_at AS "createdAt" FROM videos WHERE id = $1', [id]);
// No field resolver needed, but quotes required for camelCase in PostgreSQL
```

**Why we use Field Resolvers instead:**
- ✅ More flexible (can add logic, not just rename)
- ✅ Clearer separation of concerns
- ✅ Easier to maintain
- ✅ Can handle complex transformations (like enum uppercase)
- ✅ Standard GraphQL pattern

---

## Error Messages You'll See

### Before Fix:
```
Error: Cannot return null for non-nullable field Thread.createdAt
```

### Why:
GraphQL looks for `parent.createdAt` but database returned `parent.created_at`, so it's undefined.

### After Fix:
Field resolver maps `parent.created_at` → `createdAt`, everything works!

---

## Checklist for New Types

When adding a new GraphQL type that maps to a database table:

- [ ] Identify all snake_case columns
- [ ] Add field resolvers for timestamp fields (`created_at`, `updated_at`)
- [ ] Add field resolvers for URL fields (`*_url`)
- [ ] Add field resolvers for boolean fields (`is_*`)
- [ ] Add field resolvers for count fields (`*_count`)
- [ ] Add uppercase conversion for enum fields (status, role, etc.)
- [ ] Test the GraphQL query

---

## Quick Reference: All Current Types

| Type | Field Resolvers | Status |
|------|----------------|--------|
| User | `createdAt` | ✅ Done (in user resolver) |
| Video | `status`, `createdAt`, `updatedAt`, `thumbnailUrl`, `manifestUrl` | ✅ Done |
| Thread | `createdAt`, `updatedAt` | ✅ Done |
| Post | `createdAt`, `updatedAt`, `isExpertAnswer` | ✅ Done |
| Course | (if needed) | ⏳ Pending |
| Subscription | (if needed) | ⏳ Pending |

---

## Pro Tip: Use TypeScript Types

For better type safety, define interfaces:

```typescript
// Define database row type
interface VideoRow {
  id: string;
  title: string;
  created_at: Date;  // snake_case
  updated_at: Date;
  // ...
}

// Field resolver now has type safety
Video: {
  createdAt(parent: VideoRow) {
    return parent.created_at;  // TypeScript knows this exists
  },
}
```

---

## Summary

**Pattern:** Database snake_case → Field Resolvers → GraphQL camelCase

**When to use:** Every time you add a new GraphQL type that maps to a database table

**How:** Add simple field resolvers that return `parent.snake_case_name`

**Result:** Clean GraphQL API with proper JavaScript conventions! 🎉
