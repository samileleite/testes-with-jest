import { Account } from "../src/account";
import { transferMoney } from "../src/services/transferMoney";
import * as accounts from "../src/services/accounts";
import * as validations from "../src/services/validations";

describe("transferMoney", () => {
  beforeEach(() => {
    accounts.getAccount = jest
      .fn()
      .mockImplementationOnce((payerId) => new Account(payerId, 10000))
      .mockImplementationOnce((receiverId) => new Account(receiverId, 0));

    // outra forma de fazer os mocks acima
    // accounts.getAccount = jest
    // .fn()
    // .mockImplementationOnce ((id) => new Account(id, 10000))
    // .mockImplementationOnce ((id) => new Account(id, 0))
  });

  afterEach(() => {
    accounts.getAccount.mockClear();
  });

  test("it should charge payer with 5% of tax plus fixed tax of 100 when transfering an amount between 1000 and 5000", () => {
    const payerId = 1;
    const receiverId = 2;
    const transferAmount = 1000;
    const payerInitialBalance = 10000;
    const expectedTax = 150;

    validations.validateAmountLimit = jest.fn();
    validations.validatePayerAmount = jest.fn();

    const updatedAccounts = transferMoney(payerId, receiverId, 1000);

    expect(validations.validateAmountLimit).toHaveBeenCalledWith(
      transferAmount
    );
    expect(validations.validatePayerAmount).toHaveBeenCalledWith(
      payerInitialBalance,
      transferAmount,
      expectedTax
    );

    expect(accounts.getAccount).toHaveBeenCalledWith(payerId);
    expect(accounts.getAccount).toHaveBeenCalledWith(receiverId);
    expect(updatedAccounts).toHaveLength(2);

    expect(updatedAccounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 1, balance: 8850 }),
        expect.objectContaining({ id: 2, balance: 1000 }),
      ])
    );
  });

  test("it should validate payer balance and transfer amount", () => {
    const payerId = 1;
    const receiverId = 2;
    const transferAmount = 1000;
    const payerInitialBalance = 10000;

    validations.validateAmountLimit = jest.fn();
    validations.validatePayerAmount = jest.fn();

    transferMoney(payerId, receiverId, transferAmount);

    expect(validations.validateAmountLimit).toHaveBeenCalledWith(
      transferAmount
    );
    expect(validations.validatePayerAmount).toHaveBeenCalledWith(
      payerInitialBalance,
      transferAmount,
      150
    );
  });

  test("it should log in console when amount limit is invalid", () => {
    console.log = jest.fn();

    const payerId = 1;
    const receiverId = 2;
    const transferAmount = 1000;

    validations.validateAmountLimit = jest.fn().mockImplementation(() => {
      throw new Error("erro");
    });
    validations.validatePayerAmount = jest.fn();

    transferMoney(payerId, receiverId, transferAmount);

    expect(console.log).toHaveBeenCalledWith("erro");
  });

  test("it should test a mock of current date", () => {
    Date.now = jest.fn().mockReturnValue("2022-12-28");

    expect(Date.now()).toBe("2022-12-28");
  });

  test("it should validate payer balance and transfer amount (spy test)", () => {
    const payerId = 1;
    const receiverId = 2;
    const transferAmount = 1000;
    const payerInitialBalance = 10000;

    const validateAmountLimitSpy = jest.spyOn(
      validations,
      "validateAmountLimit"
    );
    const validatePayerAmountSpy = jest.spyOn(
      validations,
      "validatePayerAmount"
    );

    transferMoney(payerId, receiverId, transferAmount);

    expect(validateAmountLimitSpy).toHaveBeenCalledWith(transferAmount);
    expect(validatePayerAmountSpy).toHaveBeenCalledWith(
      payerInitialBalance,
      transferAmount,
      150
    );
  });
});
