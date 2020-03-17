import { add, Runner, User } from "./app";
import { createConnection, Repository, getConnection } from "typeorm";
import {
  runInTransaction,
  initialiseTestTransactions
} from "typeorm-test-transactions";

initialiseTestTransactions();

describe("app", (): void => {
  describe("add", (): void => {
    it("should be correct", (): void => {
      expect(add(32, 10)).toBe(42);
    });
  });
});

describe("Runner", (): void => {
  let userRepository: Repository<User>;
  beforeAll(
    async (): Promise<void> => {
      const connection = await createConnection({
        type: "mysql",
        host: "localhost",
        port: 53306,
        database: "mysql-transaction-sandbox",
        username: "mysql-transaction-sandbox",
        password: "mysql-transaction-sandbox",
        synchronize: true,
        entities: [User],
        logging: true
      });
      await connection.synchronize(true);
      userRepository = connection.getRepository<User>(User);
      await userRepository.save(
        userRepository.create({ id: 1, name: "Tom", score: 0 })
      );
    }
  );
  it("ok", async (): Promise<void> => {
    const runner = new Runner();

    await runner.run();

    const user = await userRepository.findOneOrFail(1);
    expect(user.score).toBe(200);
  });
  describe("getUser", (): void => {
    it("should be failed", async (): Promise<void> => {
      const runner = new Runner();
      await expect(runner["getUser"](1)).rejects.toThrow();
    });
    it(
      "should be pass",
      runInTransaction(
        async (): Promise<void> => {
          const runner = new Runner();
          await expect(runner["getUser"](1)).resolves.toBeDefined();
        }
      )
    );
  });
});
