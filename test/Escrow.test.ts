import { BigNumber, Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

describe("Escrow", () => {
    let Escrow: ContractFactory;
    let escrow: Contract;

    let lawyer: SignerWithAddress;
    let payer: SignerWithAddress;
    let payee: SignerWithAddress;

    const AMOUNT = BigNumber.from(1000);

    before(async () => {
        [lawyer, payer, payee] = await ethers.getSigners();
        Escrow = await ethers.getContractFactory("Escrow");
    })

    beforeEach(async () => {
        escrow = await Escrow.deploy(payer.address, payee.address, AMOUNT);
        await escrow.deployed();
    })

    describe("Deposit", () => {
        it("Should deposit successfully", async () => {
            await escrow.connect(payer).deposit({value: AMOUNT});
            expect(await ethers.provider.getBalance(escrow.address))
                .to.be.equal(AMOUNT);
            expect(await escrow.balanceOf()).to.be.equal(AMOUNT);
        })

        it("Shouldn't deposit if not called by payer", async () => {
            await expect(
                escrow.connect(payee).deposit({value: AMOUNT})
            ).to.be.revertedWith("Only payer can deposit money.")
        })

        it("Shouldn't deposit if fund sent is bigger than target amount", async () => {
            const amount = AMOUNT.add(1);
            await expect(
                escrow.connect(payer).deposit({value: amount})
            ).to.be.revertedWith("Fund exceeds the target amount to hold.");
        })
    })

    describe("Receive", () => {
        describe("After deposit correctly", () => {
            beforeEach(async () => {
                await escrow.connect(payer).deposit({value: AMOUNT});
            })

            it("Should release fund successfully", async () => {
                const initialBalance = await payee.getBalance();
                await escrow.connect(lawyer).release();
                const finalBalance = await payee.getBalance();
                expect(finalBalance.sub(initialBalance))
                    .to.be.equal(AMOUNT)
            })

            it("Should not release if not called by lawyer", async () => {
                await expect(
                    escrow.connect(payee).release()
                ).to.be.revertedWith("Only lawyer can release fund.");
            })
        })

        it("Shouldn't release if fund doesn't reach target amount yet", async () => {
            await expect(
                escrow.connect(lawyer).release()
            ).to.be.revertedWith("Fund doesn't reach the target amount.")
        })
    })
})