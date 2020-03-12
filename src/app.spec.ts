import { add } from "./app";

const mocked = add as jest.Mocked<typeof add>;

describe("app", (): void => {
  describe("add", (): void => {
    it("should be correct", (): void => {
      expect(add(32, 10)).toBe(42);
    });
  });
});
