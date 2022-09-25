import { ethers, } from "hardhat"
import { Donation } from "../typechain-types";
import { expect } from "chai";

describe("Donation",async () => {
    let donation: Donation;
    let accounts: any[];

    before(async () => {
        accounts = await ethers.getSigners();
    })

    beforeEach(async () => {
        const Donation = await ethers.getContractFactory("Donation");
        donation = await Donation.deploy();
    })

    it("Should donate correctly", async () => {
        await donation.connect(accounts[1]).donate({ value: ethers.utils.parseEther("1.0") });
        // check that amount was added in a mapping
    })

    it("new",async () => {
        await donation.connect(accounts[1]).donate({ value: ethers.utils.parseEther("1.0") });

        const balanceBefore = await accounts[2].getBalance()
        await donation.releaseFunds(accounts[2].address, ethers.utils.parseEther("0.5"));
        const balanceAfter = await accounts[2].getBalance()


        expect(balanceAfter).to.be.equal(balanceBefore.add(ethers.utils.parseEther("0.5")));
    })
})