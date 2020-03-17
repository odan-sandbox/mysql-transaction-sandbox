import "reflect-metadata";

import {
  createConnection,
  Entity,
  Column,
  PrimaryColumn,
  Connection,
  getRepository,
  Repository
} from "typeorm";
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
  Transactional
} from "typeorm-transactional-cls-hooked";

initializeTransactionalContext();
patchTypeORMRepositoryWithBaseRepository();

export function add(x: number, y: number): number {
  return x + y;
}

@Entity()
export class User {
  @PrimaryColumn()
  public id!: number;

  @Column()
  public name!: string;

  @Column()
  public score!: number;
}

const sleep = async (msec: number): Promise<void> =>
  new Promise((resolve): void => {
    setTimeout((): void => resolve(), msec);
  });

async function taskA(connection: Connection): Promise<void> {
  console.log("start taskA");
  await connection.manager.transaction(
    async (entityManeger): Promise<void> => {
      console.log(connection.manager.connection.name);
      console.log(entityManeger.connection.name);
      const userRepository = entityManeger.getRepository<User>(User);
      const user = await userRepository.findOne(1, {
        lock: { mode: "pessimistic_write" }
      });

      await sleep(1000);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      user!.score += 100;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await userRepository.save(user!);
    }
  );

  console.log("end taskA");
}

export class Runner {
  private readonly userRepository: Repository<User>;
  public constructor() {
    this.userRepository = getRepository<User>(User);
  }
  private async getUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne(userId, {
      lock: { mode: "pessimistic_write" }
    });

    if (!user) throw "";

    return user;
  }

  private async updateScore(user: User): Promise<User> {
    user.score += 100;
    return await this.userRepository.save(user);
  }

  // アトミックな操作になる
  @Transactional()
  public async taskB(): Promise<void> {
    console.log("start taskB");
    const user = await this.getUser(1);
    await sleep(1000);

    await this.updateScore(user);
  }

  public async run(): Promise<void> {
    await Promise.all([this.taskB(), this.taskB()]);
  }
}
async function main(): Promise<void> {
  const connection = await createConnection({
    type: "mysql",
    host: "localhost",
    port: 63306,
    database: "mysql-transaction-sandbox",
    username: "mysql-transaction-sandbox",
    password: "mysql-transaction-sandbox",
    synchronize: true,
    entities: [User],
    logging: true
  });
  const userRepository = connection.getRepository<User>(User);

  await userRepository.save(
    userRepository.create({ id: 1, name: "Tom", score: 0 })
  );
  console.log(await userRepository.find());

  const runner = new Runner();
  await runner.run();
  // await Promise.all([runner.taskB(), runner.taskB()]);
  // await Promise.all([taskA(connection), taskA(connection)]);

  console.log(await userRepository.find());

  await connection.close();
}

if (!module.parent) {
  main();
}
