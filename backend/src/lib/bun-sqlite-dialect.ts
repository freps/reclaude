import type { Database, Statement } from "bun:sqlite";
import type {
  DatabaseConnection,
  DatabaseIntrospector,
  Dialect,
  DialectAdapter,
  Driver,
  Kysely,
  QueryCompiler,
  QueryResult,
  TransactionSettings,
} from "kysely";

import { CompiledQuery, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from "kysely";

// Inline replacement for kysely-bun-sqlite to avoid CJS/ESM incompatibility.
// kysely@0.28+ is ESM-only; kysely-bun-sqlite ships a CJS build that calls require()
// which Bun on Linux refuses for async ESM modules.

type BunSqliteDialectConfig = {
  database: Database;
  onCreateConnection?: (connection: DatabaseConnection) => Promise<void>;
};

type BunStatement = Statement & { columnNames: string[] };

class BunSqliteConnection implements DatabaseConnection {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  executeQuery<R>(compiledQuery: CompiledQuery): Promise<QueryResult<R>> {
    const { parameters, sql } = compiledQuery;
    const stmt = this.#db.prepare(sql) as BunStatement;

    if (stmt.columnNames.length > 0) {
      return Promise.resolve({ rows: stmt.all(parameters as unknown[]) as unknown as R[] });
    }

    const result = stmt.run(parameters as unknown[]);
    return Promise.resolve({
      insertId: BigInt(result.lastInsertRowid),
      numAffectedRows: BigInt(result.changes),
      rows: [] as R[],
    });
  }

  async *streamQuery<R>(
    compiledQuery: CompiledQuery,
    _chunkSize: number,
  ): AsyncIterableIterator<QueryResult<R>> {
    const { parameters, sql } = compiledQuery;
    const stmt = this.#db.prepare(sql) as BunStatement & {
      iterate(params: unknown[]): Iterable<R>;
    };
    for await (const row of stmt.iterate(parameters as unknown[])) {
      yield { rows: [row as unknown as R] };
    }
  }
}

class ConnectionMutex {
  #promise: Promise<void> | undefined;
  #resolve: (() => void) | undefined;

  async lock(): Promise<void> {
    while (this.#promise) {
      await this.#promise;
    }
    this.#promise = new Promise((resolve) => {
      this.#resolve = resolve;
    });
  }

  unlock(): void {
    const resolve = this.#resolve;
    this.#promise = undefined;
    this.#resolve = undefined;
    resolve?.();
  }
}

class BunSqliteDriver implements Driver {
  readonly #config: BunSqliteDialectConfig;
  #connection: BunSqliteConnection | undefined;
  readonly #connectionMutex = new ConnectionMutex();

  constructor(config: BunSqliteDialectConfig) {
    this.#config = { ...config };
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    await this.#connectionMutex.lock();
    return this.#connection!;
  }

  async beginTransaction(
    connection: DatabaseConnection,
    settings: TransactionSettings,
  ): Promise<void> {
    const parts = ["begin"];
    if (settings.isolationLevel) parts.push(settings.isolationLevel);
    if (settings.accessMode) parts.push(settings.accessMode);
    await connection.executeQuery(CompiledQuery.raw(parts.join(" ")));
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("commit"));
  }

  async destroy(): Promise<void> {
    this.#config.database.close();
  }

  async init(): Promise<void> {
    this.#connection = new BunSqliteConnection(this.#config.database);
    if (this.#config.onCreateConnection) {
      await this.#config.onCreateConnection(this.#connection);
    }
  }

  async releaseConnection(): Promise<void> {
    this.#connectionMutex.unlock();
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("rollback"));
  }
}

export class BunSqliteDialect implements Dialect {
  readonly #config: BunSqliteDialectConfig;

  constructor(config: BunSqliteDialectConfig) {
    this.#config = { ...config };
  }

  createAdapter(): DialectAdapter {
    return new SqliteAdapter();
  }

  createDriver(): Driver {
    return new BunSqliteDriver(this.#config);
  }

  createIntrospector(db: Kysely<unknown>): DatabaseIntrospector {
    return new SqliteIntrospector(db);
  }

  createQueryCompiler(): QueryCompiler {
    return new SqliteQueryCompiler();
  }
}
