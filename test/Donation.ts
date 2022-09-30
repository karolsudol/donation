import { ethers } from "hardhat";
import { Donation } from "../typechain-types";

import { expect, assert } from "chai";

describe("Donation", async () => {
  let donation: Donation;
  let accounts: any[];

  const { waffle } = require("hardhat");
  const provider = waffle.provider;

  before(async () => {
    accounts = await ethers.getSigners();
  });

  beforeEach(async () => {
    const Donation = await ethers.getContractFactory("Donation");
    donation = await Donation.deploy();
  });

  it("Should donate correctly", async () => {
    // contract address starts with zero as 0 donations
    const balance0ETH = await provider.getBalance(donation.address);
    expect(balance0ETH).to.be.equal(ethers.utils.parseEther("0.0"));

    // acc1 donates 1.0 -> total: 1
    await donation
      .connect(accounts[1])
      .donate({ value: ethers.utils.parseEther("1.0") });
    const balance1ETH = await provider.getBalance(donation.address);
    expect(balance1ETH).to.be.equal(ethers.utils.parseEther("1.0"));

    // acc2 donates 1.0 -> total: 2
    await donation
      .connect(accounts[2])
      .donate({ value: ethers.utils.parseEther("1.0") });
    const balance2ETH = await provider.getBalance(donation.address);
    expect(balance2ETH).to.be.equal(ethers.utils.parseEther("2.0"));

    // do not accept zero values
    await expect(
      donation.donate({ value: ethers.utils.parseEther("0.0") })
    ).to.be.revertedWith("donation is 0");
  });

  it("Should release funds correctly", async () => {
    const owner = donation.owner;

    // A. acc2 donates 1.0 -> total: 1
    await donation
      .connect(accounts[1])
      .donate({ value: ethers.utils.parseEther("1.0") });

    await expect(
      donation.releaseFunds(
        accounts[2].address,
        ethers.utils.parseEther("10.0")
      )
    ).to.be.revertedWith("amount insufficient");

    // B. do not send funds to empty address
    await expect(
      donation.releaseFunds(
        ethers.constants.AddressZero,
        ethers.utils.parseEther("1.0")
      )
    ).to.be.revertedWith("address 0");

    // C. only owner can make a withdrawal
    // await expect(
    //   await donation
    //     .connect(ethers.constants.AddressZero)
    //     .releaseFunds(accounts[1].address, ethers.utils.parseEther("1.0"))
    // ).to.be.revertedWith("only ownwer");

    // D. so total is still 1.0, withdraw half and check balance
    const balanceBefore = await accounts[2].getBalance();
    await donation.releaseFunds(
      accounts[2].address,
      ethers.utils.parseEther("0.5")
    );
    const balanceAfter = await accounts[2].getBalance();
    expect(balanceAfter).to.be.equal(
      balanceBefore.add(ethers.utils.parseEther("0.5"))
    );

    // E. so total is still 0.5, break withdraw with bigger ammount
    await expect(
      donation.releaseFunds(
        accounts[2].address,
        ethers.utils.parseEther("10.0")
      )
    ).to.be.revertedWith("amount insufficient");
  });

  it("Should record donors addreses and payment details correctly", async () => {
    // A. donors list starts empty -> nobody donated yet
    const donors0 = await donation.getDonors();
    expect(donors0.length).to.equal(0.0);

    // so is total 0
    // const total0 = donation.totalAmount;
    // assert.equal(donation.totalAmount, 0.0);
    expect(donation.totalAmount).to.equal(0);

    // B. acc1 donates 1.0 -> donors list is updated to 1 pax with only this adress
    await donation
      .connect(accounts[1])
      .donate({ value: ethers.utils.parseEther("1.0") });
    const donors1 = await donation.getDonors();
    expect(donors1.length).to.be.equal(1);
    expect(donors1[0]).to.be.equal(accounts[1].address);

    // total is now 1
    const total1 = donation.totalAmount;
    expect(total1).to.equal(1);

    // C. acc2 donates 1.0 -> donors list is updated to 2 pax, with extra address
    await donation
      .connect(accounts[2])
      .donate({ value: ethers.utils.parseEther("1.0") });
    const donors2 = await donation.getDonors();
    expect(donors2.length).to.be.equal(2);
    expect(donors2[0]).to.be.equal(accounts[1].address);
    expect(donors2[1]).to.be.equal(accounts[2].address);

    // total is now 2
    const total2 = donation.totalAmount;
    expect(total2).to.equal(2);

    // D. acc1 donates 1.0 again -> donors list should not change as duplicate
    await donation
      .connect(accounts[1])
      .donate({ value: ethers.utils.parseEther("1.0") });
    const donors3 = await donation.getDonors();
    expect(donors3.length).to.be.equal(2);
    expect(donors3[0]).to.be.equal(accounts[1].address);
    expect(donors3[1]).to.be.equal(accounts[2].address);

    // total is now 3
    const total3 = donation.totalAmount;
    expect(total3).to.equal(3);
  });
});
