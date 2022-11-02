import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

describe("Deed", () => {
    let Deed: ContractFactory;
    let deed: Contract;

    let lawyer: SignerWithAddress;
    let beneficiary: SignerWithAddress;
    const VALUE = 100;

    before(async () => {
        [, lawyer, beneficiary] = await ethers.getSigners();
        Deed = await ethers.getContractFactory("Deed");
    })

    describe("Wait before calling", () => {
        const fromNowInSec = 1;

        beforeEach(async () => {
            deed = await Deed.deploy(
                lawyer.address,
                beneficiary.address,
                fromNowInSec,
                {value: VALUE}
            );
            await deed.deployed();

            // Wait for fromNowInSec
            await new Promise(resolve => setTimeout(resolve, fromNowInSec * 1000));
        })

        it("Should withdraw successfully", async () => {
            const initialBalance = await beneficiary.getBalance();
            await deed.connect(lawyer).withdraw()
            const finalBalance = await beneficiary.getBalance();

            expect(finalBalance.sub(initialBalance)).to.be.equal(ethers.BigNumber.from(VALUE));
        });

        it("Shouldn't withdraw if not invoked by lawyer", async () => {
            await expect(deed.connect(beneficiary).withdraw())
                .to.be.revertedWith("Only the lawyer can invoke the withdrawal.");
        })
    })

    describe("Do not wait, call immediately", () => {
        it("Shouldn't withdraw before the earliest timestamp", async () => {
            const fromNowInSecLarge = 100;
            deed = await Deed.deploy(
                lawyer.address,
                beneficiary.address,
                fromNowInSecLarge,
                {value: VALUE}
            );
            await deed.deployed();
            await expect(deed.connect(lawyer).withdraw())
                .to.be.revertedWith("It is too early to invoke the withdrawal.")
        })
    })
})