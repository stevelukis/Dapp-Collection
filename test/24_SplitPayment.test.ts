import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";

describe("SplitPayment", () => {
    let SplitPayment: ContractFactory;
    let splitPayment: Contract;

    let owner: SignerWithAddress;
    let address1: SignerWithAddress;
    let address2: SignerWithAddress;

    before(async () => {
        [owner, address1, address2] = await ethers.getSigners();
        SplitPayment = await ethers.getContractFactory("SplitPayment");
    })

    beforeEach(async () => {
        splitPayment = await SplitPayment.deploy(owner.address);
        await splitPayment.deployed();
    })

    it("Should split payment correctly", async () => {
        const startBalanceAddress1 = await address1.getBalance();
        const startBalanceAddress2 = await address2.getBalance();

        const to = [address1.address, address2.address];
        const amount = [100, 200];

        const endBalanceAddress1 = startBalanceAddress1.add(amount[0]);
        const endBalanceAddress2 = startBalanceAddress2.add(amount[1]);

        // Total of amount
        const value = amount.reduce((prev, current) => prev + current);

        await splitPayment.send(to, amount, {value});

        expect(await address1.getBalance()).to.be.equal(endBalanceAddress1);
        expect(await address2.getBalance()).to.be.equal(endBalanceAddress2);
    });

});