import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";

describe("SplitPayment", () => {
    let SplitPayment: ContractFactory;
    let splitPayment: Contract;

    let accounts: SignerWithAddress[];

    before(async () => {
        accounts = await ethers.getSigners();
        SplitPayment = await ethers.getContractFactory("SplitPayment");
    })

    beforeEach(async () => {
        let owner = accounts[0];
        splitPayment = await SplitPayment.deploy(owner.address);
        await splitPayment.deployed();
    })

    it("Should split payment correctly", async () => {
        const recipients = [accounts[1], accounts[2], accounts[3]];
        const to = recipients.map(recipient => recipient.address);
        const amounts = [100, 200, 300];

        // Get the balances before calling the function
        const initialBalances = await Promise.all(recipients.map(recipient => {
            return recipient.getBalance();
        }));

        // Total of amounts
        const value = amounts.reduce((prevAmount, currentAmount) => prevAmount + currentAmount);

        // Call the function
        await splitPayment.send(to, amounts, {value});

        // Get the balance after calling the function
        const endBalances = await Promise.all(recipients.map(recipient => {
            return recipient.getBalance();
        }));

        recipients.forEach((recipient, index) => {
            const initialBalance = initialBalances[index];
            const endBalance = endBalances[index];

            // The difference should be equal to the amount for the recipient
            expect(endBalance.sub(initialBalance)).to.be.equal(amounts[index])
        });
    });

    it("Should not split payment if arrays length don't match", async () => {
        const recipients = [accounts[1], accounts[2], accounts[3]];
        const to = recipients.map(recipient => recipient.address);
        const amounts = [100, 200];

        // Total of amounts
        const value = amounts.reduce((prevAmount, currentAmount) => prevAmount + currentAmount);

        await expect(splitPayment.send(to, amounts, {value}))
            .to.be.revertedWith("to and amount array must have same length.")
    })

});