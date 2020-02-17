import {
  createConnection,
  Entity,
  Column,
  PrimaryColumn,
  Connection
} from "typeorm";

export function add(x: number, y: number): number {
  return x + y;
}

@Entity()
class User {
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

async function main(): Promise<void> {
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
  const userRepository = connection.getRepository<User>(User);

  await userRepository.save(
    userRepository.create({ id: 1, name: "Tom", score: 0 })
  );
  console.log(await userRepository.find());

  await Promise.all([taskA(connection), taskA(connection)]);

  console.log(await userRepository.find());

  await connection.close();
}

main();
