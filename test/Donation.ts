import { ethers } from "hardhat";
import { Donation } from "../typechain-types";

import { expect } from "chai";

describe("Donation", async () => {
  let donation: Donation;
  let accounts: any[];

  before(async () => {
    accounts = await ethers.getSigners();
  });

  beforeEach(async () => {
    const Donation = await ethers.getContractFactory("Donation");
    donation = await Donation.deploy();
  });

  it("Should donate correctly", async () => {
    await donation
      .connect(accounts[1])
      .donate({ value: ethers.utils.parseEther("1.0") });

    const { waffle } = require("hardhat");
    const provider = waffle.provider;

    const balance0ETH = await provider.getBalance(donation.address);
    expect(balance0ETH).to.be.equal(ethers.utils.parseEther("1.0"));
  });

  it("Should release funds correctly", async () => {
    await donation
      .connect(accounts[1])
      .donate({ value: ethers.utils.parseEther("1.0") });

    const balanceBefore = await accounts[2].getBalance();
    await donation.releaseFunds(
      accounts[2].address,
      ethers.utils.parseEther("0.5")
    );
    const balanceAfter = await accounts[2].getBalance();

    expect(balanceAfter).to.be.equal(
      balanceBefore.add(ethers.utils.parseEther("0.5"))
    );
  });

  it("Should record donors addreses and payment details correctly", async () => {
    await donation
      .connect(accounts[1])
      .donate({ value: ethers.utils.parseEther("2.0") });
    await donation
      .connect(accounts[2])
      .donate({ value: ethers.utils.parseEther("1.0") });

    const donors = await donation.getDonors();
    expect(donors.length).to.be.equal(2);
    expect(donors[0]).to.be.equal(accounts[1].address);

    // TBD: struggle to get eth values saved for each address in mapping

    // const amounts = donation.amounts;
    // expect((await amounts(accounts[1])).toNumber).to.be.equal(2.0);
  });
});
