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

    await expect(
      donation.donate({ value: ethers.utils.parseEther("0.0") })
    ).to.be.revertedWith("donations cannot be 0");
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

    await expect(
      donation.releaseFunds(
        accounts[2].address,
        ethers.utils.parseEther("1000.0")
      )
    ).to.be.revertedWith("amount requested unsufficient");

    // @teacher how to test 1. whether address is zero and  2. is not owner
    //
    // owner = donation.owner;
    // await expect(
    //   donation.releaseFunds(payable(address(0)), ethers.utils.parseEther("0.5"))
    // ).to.be.revertedWith("amount requested unsufficient");
  });

  it("Should record donors addreses and payment details correctly", async () => {
    const donors = await donation.getDonors();
    expect(donors.length).to.be.equal(0);
    await donation
      .connect(accounts[1])
      .donate({ value: ethers.utils.parseEther("2.0") });
    const donors1 = await donation.getDonors();
    expect(donors1.length).to.be.equal(1);
    expect(donors1[0]).to.be.equal(accounts[1].address);

    await donation
      .connect(accounts[2])
      .donate({ value: ethers.utils.parseEther("1.0") });
    const donors2 = await donation.getDonors();
    expect(donors2.length).to.be.equal(2);
    expect(donors2[0]).to.be.equal(accounts[1].address);
    expect(donors2[1]).to.be.equal(accounts[2].address);

    // await donation
    //   .connect(accounts[1])
    //   .donate({ value: ethers.utils.parseEther("2.0") });
    // expect(donors.length).to.be.equal(2);

    // TBD: struggle to get eth values saved for each address in mapping

    // const amounts = donation.amounts;
    // expect((await amounts(accounts[1])).toNumber).to.be.equal(2.0);
  });
});
