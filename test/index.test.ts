import { createCookieSessionStorage } from "@remix-run/node";
import { MyStrategy } from "../src";

describe(MyStrategy, () => {
  const verify = jest.fn();
  // You will probably need a sessionStorage to test the strategy.
  const sessionStorage = createCookieSessionStorage({
    cookie: { secrets: ["s3cr3t"] },
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should have the name of the strategy", () => {
    const strategy = new MyStrategy({ something: "You may need" }, verify);
    expect(strategy.name).toBe("change-me");
  });

  test.todo("Write more tests to check everything works as expected");
});
