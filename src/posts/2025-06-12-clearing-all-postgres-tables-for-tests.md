---
title: Clearing all postgres tables for tests
description:
date: 2025-06-12 15:15:15
---

Have you written acceptance tests or integrations tests in Java/Kotlin using [Testcontainers Postgresql](https://testcontainers.com/modules/postgresql/),
and you reuse the container across tests to save time?
Then you likely want to clear the database to avoid contamination between tests.

Here is a small code snippet to clear postgres tables (except flyway migrations).
It uses [Jdbi](https://jdbi.org/) to execute the SQL.

```kotlin
jdbi.useHandle<Exception> { handle ->
    handle.execute(
        """DO ${'$'}${'$'}DECLARE tablename TEXT;
  BEGIN
      FOR tablename IN (SELECT table_name
                         FROM information_schema.tables
                         WHERE table_schema = 'public'
                           AND table_type = 'BASE TABLE'
                           AND table_catalog = '${testDatabaseName}'
                           AND table_name not like 'flyway%')
      LOOP
          EXECUTE 'TRUNCATE TABLE ' || tablename || ' RESTART IDENTITY CASCADE;';
      END LOOP;
  END${'$'}${'$'};""",
    )
  }
```

Put this in a function like `fun clearAllData() { ... }`, and run it in Junit's `beforeEach` or `afterEach`.
