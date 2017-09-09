var assert = require('assert');
var Embark = require('embark');
var EmbarkSpec = Embark.initTests();
var web3 = EmbarkSpec.web3;


function ether(n) {
    return web3.toWei(n, "ether");
}

describe("EtherPush", function () {
    // this.timeout(1000);
    const unique = {}
    let accounts;
    let account;
    before(function(done) {
        this.timeout(0);
        web3.eth.getAccounts((err, rv) => {
            if (err) {
                return done(err);
            }

            accounts = rv;
            account = accounts[0];

            const contractsConfig = {
                "EtherPush": {
                  gas: "2000000",
                  from: account,
                },
                "PushToken": {
                  gas: "2000000",
                  from: account,
                }
            };

            EmbarkSpec.deployAll(contractsConfig, done);
        });
    });

    it("etherpush should zero balance", (done) => {
      web3.eth.getBalance(EtherPush.address, (err, rv) => {
        if (err) return done(err);
        assert.equal(rv, ether(0));
        return done();
      });
    });

    it("sellerfee shoule be 0.5% at default", (done) => {
      EtherPush.getSellerfee((err, rv) => {
        console.log(err);
          if (err) return done(err);
          assert.equal(rv, ether(0.005));
          done();
      });
    });

    it("buyerfee shoule be 0.5% at default", (done) => {
      EtherPush.getBuyerfee((err, rv) => {
          if (err) return done(err);
          assert.equal(rv, ether(0.005));
          done();
      });
    });

    it("sellerfeeDivide should be 1000000 at default", (done) => {
      EtherPush.sellerfeeDivide((err, rv) => {
          if (err) return done(err);
          assert.equal(rv, ether(1));
          done();
      });
    });

    it("buyerfeeDivide should be 1000000 at default", (done) => {
      EtherPush.buyerfeeDivide((err, rv) => {
          if (err) return done(err);
          assert.equal(rv, ether(1));
          done();
      });
    });

    it("cannot set owner to 0", (done) => {
      EtherPush.ownerChangeOwner(0, (err, rv) => {
        if (err) return done();
        return done(new Error());
      });
    });

    it("onwer set new owner", (done) => {
      EtherPush.ownerChangeOwner(accounts[1], (err, rv) => {
        if (err) return done();
        EtherPush.ownerChangeOwner(accounts[0], {from: accounts[1]}, (err, rv) => {
          if (err) return done(err);
          return done();
        });
      });
    });

    it("user can't change fee", (done) => {
      EtherPush.ownerChangeSellerfee(ether(0.005), {from: accounts[1]}, (err, rv) => {
        if (err) return done();
        return done(new Error());
      });
    });

    it("owner can change fee", (done) => {
      EtherPush.ownerChangeSellerfee(ether(0.005), {from: accounts[0]}, (err, rv) => {
        if (err) return done(err);
        return done();
      });
    });

    it("user can't change fee", (done) => {
      EtherPush.ownerChangeBuyerfee(ether(0.005), {from: accounts[1]}, (err, rv) => {
        if (err) return done();
        return done(new Error());
      });
    });

    it("owner can change fee", (done) => {
      EtherPush.ownerChangeBuyerfee(ether(0.005), {from: accounts[0]}, (err, rv) => {
        if (err) return done(err);
        return done();
      });
    });

    it("should be running", (done) => {
      EtherPush.getRunning((err, rv) => {
        if (err) return done(err);
        assert.equal(rv, true);
        return done();
      });
    });

    it("user cannot change running", (done) => {
      EtherPush.ownerChangeRunning(true, {from: accounts[1]}, (err, rv) => {
        if (err) return done();
        return done(new Error());
      });
    });

    it("user cannot withdarw contract balance", (done) => {
      EtherPush.ownerWithdrawAccount(accounts[0], {from: accounts[1]}, (err, rv) => {
        if (err) return done();
        return done(new Error());
      });
    });

    it("user cannot withdarw contract balance", (done) => {
      EtherPush.ownerWithdraw({from: accounts[1]}, (err, rv) => {
        if (err) return done();
        return done(new Error());
      });
    });

    it("owner change running", (done) => {
      EtherPush.ownerChangeRunning(false, {from:accounts[0]}, (err, rv) => {
        if (err) return done();
        EtherPush.getRunning((err, rv) => {
          if (err) return done();
          assert.equal(rv, false);
          EtherPush.ownerChangeRunning(true, {from:accounts[0]}, (err, rv) => {
            if (err) return done();
            return done();
          });
        });
      });
    });

    it("PushToken should give accounts[0] 100000000000000000000000000", (done) => {
      PushToken.balanceOf(account, (err, rv) => {
        if (err) return done(err);
        assert(rv.equals(1e+26));
        return done();
      });
    });

    it("accounts[0] depositToken", (done) => {
      PushToken.approve(EtherPush.address, 100*(1000000000000000000), (err, rv) => {
        if (err) return done(err);
        EtherPush.depositToken(PushToken.address, 100*(1000000000000000000), (err, rv) => {
          if (err) return done(err);
          EtherPush.onDeposit((err, rv) => {
            if (err) return done(err);
            if (unique[rv.transactionHash] == true) {
              return;
            }
            unique[rv.transactionHash] = true;
            const args = rv.args;
            const token = args.token;
            const user = args.user;
            const amount = args.amount;
            const balance = args.balance;
            assert.equal(token, PushToken.address);
            assert.equal(user, accounts[0]);
            assert.equal(amount, 100*(1000000000000000000));
            assert.equal(balance, 100*(1000000000000000000));
            done();
          });
        });
      });
    });

    it("accounts[0] balance", (done) => {
      EtherPush.balanceOf(PushToken.address, accounts[0], (err, rv) => {
        assert.equal(rv, 100*(1000000000000000000));
        return done();
      });
    });

    it("accounts[0] withdarw token", (done) => {
      EtherPush.withdrawAmountToken(PushToken.address, 10*(1000000000000000000), (err, rv) => {
        if (err) return done(err);
        EtherPush.onWithdraw((err, rv) => {
            if (err) return done(err);

            if (unique[rv.transactionHash] == true) {
              return;
            }
            unique[rv.transactionHash] = true;

            const args = rv.args;
            const token = args.token;
            const user = args.user;
            const amount = args.amount;
            const balance = args.balance;

            assert.equal(token, PushToken.address);
            assert.equal(user, accounts[0]);
            assert.equal(amount, 10*(1000000000000000000));
            assert.equal(balance, 90*(1000000000000000000));
            done();
        });
      });
    });

    it("accounts[0] withdarw all token", (done) => {
      EtherPush.withdrawToken(PushToken.address, (err, rv) => {
        if (err) return done(err);
        EtherPush.onWithdraw((err, rv) => {
            if (err) return done(err);

            if (unique[rv.transactionHash] == true) {
              return;
            }
            unique[rv.transactionHash] = true;

            const args = rv.args;
            const token = args.token;
            const user = args.user;
            const amount = args.amount;
            const balance = args.balance;

            assert.equal(token, PushToken.address);
            assert.equal(user, accounts[0]);
            assert.equal(amount, 90*(1000000000000000000));
            assert.equal(balance, 0*(1000000000000000000));
            done();
        });
      });
    });

    it("accounts[1] depositETH", (done) => {
      EtherPush.depositETH({from: accounts[1], value:ether(10)}, (err, rv) => {
          if (err) {return done(err);}
          EtherPush.onDeposit((err, rv) => {
            if (err) return done(err);

            if (unique[rv.transactionHash] == true) {
              return;
            }
            unique[rv.transactionHash] = true;
            const args = rv.args;
            const token = args.token;
            const user = args.user;
            const amount = args.amount;
            const balance = args.balance;
            assert.equal(token, 0);
            assert.equal(user, accounts[1]);
            assert.equal(amount, ether(10));
            assert.equal(balance, ether(10));
            done();
          });
      });
    });

    it("accounts[1] balance", (done) => {
      EtherPush.balanceOf(0, accounts[1], (err, rv) => {
        assert.equal(rv, ether(10));
        return done();
      });
    });

    it("accounts[1] withdarw token", (done) => {
      EtherPush.withdrawAmountETH(ether(1), {from: accounts[1]}, (err, rv) => {
        if (err) return done(err);
        EtherPush.onWithdraw((err, rv) => {
            if (err) return done(err);

            if (unique[rv.transactionHash] == true) {
              return;
            }
            unique[rv.transactionHash] = true;

            const args = rv.args;
            const token = args.token;
            const user = args.user;
            const amount = args.amount;
            const balance = args.balance;

            assert.equal(token, 0);
            assert.equal(user, accounts[1]);
            assert.equal(amount, ether(1));
            assert.equal(balance, ether(9));
            done();
        });
      });
    });

    it("accounts[0] withdarw all token", (done) => {
      EtherPush.withdrawETH({from: accounts[1]}, (err, rv) => {
        if (err) return done(err);
        EtherPush.onWithdraw((err, rv) => {
            if (err) return done(err);

            if (unique[rv.transactionHash] == true) {
              return;
            }
            unique[rv.transactionHash] = true;

            const args = rv.args;
            const token = args.token;
            const user = args.user;
            const amount = args.amount;
            const balance = args.balance;

            assert.equal(token, 0);
            assert.equal(user, accounts[1]);
            assert.equal(amount, ether(9));
            assert.equal(balance, 0);
            done();
        });
      });
    });

    it("accounts[0] depositToken", (done) => {
      PushToken.approve(EtherPush.address, 100*(1000000000000000000), (err, rv) => {
        if (err) return done(err);
        EtherPush.depositToken(PushToken.address, 100*(1000000000000000000), (err, rv) => {
          if (err) return done(err);
          EtherPush.onDeposit((err, rv) => {
            if (err) return done(err);
            if (unique[rv.transactionHash] == true) {
              return;
            }
            unique[rv.transactionHash] = true;
            const args = rv.args;
            const token = args.token;
            const user = args.user;
            const amount = args.amount;
            const balance = args.balance;
            assert.equal(token, PushToken.address);
            assert.equal(user, accounts[0]);
            assert.equal(amount, 100*(1000000000000000000));
            assert.equal(balance, 100*(1000000000000000000));
            done();
          });
        });
      });
    });

    it("accounts[1] depositETH", (done) => {
      EtherPush.depositETH({from: accounts[1], value:ether(10)}, (err, rv) => {
          if (err) {return done(err);}
          EtherPush.onDeposit((err, rv) => {
            if (err) return done(err);

            if (unique[rv.transactionHash] == true) {
              return;
            }
            unique[rv.transactionHash] = true;
            const args = rv.args;
            const token = args.token;
            const user = args.user;
            const amount = args.amount;
            const balance = args.balance;
            assert.equal(token, 0);
            assert.equal(user, accounts[1]);
            assert.equal(amount, ether(10));
            assert.equal(balance, ether(10));
            done();
          });
      });
    });

    it("accounts[0] balance", (done) => {
      EtherPush.balanceOf(PushToken.address, accounts[0], (err, rv) => {
        assert.equal(rv, 100*(1000000000000000000));
        return done();
      });
    });

    it("accounts[1] balance", (done) => {
      EtherPush.balanceOf(0, accounts[1], (err, rv) => {
        assert.equal(rv, ether(10));
        return done();
      });
    });

    it("change owner to accounts[2]", (done) => {
      EtherPush.ownerChangeOwner(accounts[2], (err, rv) => {
        if (err) return done();
        done();
      });
    });

    it("accounts[0] to sell token", (done) => {
      // (address sell, uint sellamount, address buy, uint buyamount, uint id, address buyer)
      EtherPush.tosell(PushToken.address, 10*(1000000000000000000), 0, ether(10), 123456789, 0,
      {
        from: accounts[0],
        gas: 100000,
      }, (err, rv) => {
        if (err) return done(err);

        EtherPush.onSell((err, rv) => {
          if (err) return done(err);

          if (unique[rv.transactionHash] == true) {
            return;
          }
          unique[rv.transactionHash] = true;

          const args = rv.args;
          const sell = args.sell;
          const sellamount = args.sellamount;
          const buy = args.buy;
          const buyamount = args.buyamount;
          const id = args.id;
          const seller = args.seller;
          const buyer = args.buyer;

          assert.equal(sell, PushToken.address);
          assert.equal(sellamount, 10*(1000000000000000000));
          assert.equal(buy, 0);
          assert.equal(buyamount, ether(10));
          assert.equal(buyer, 0);
          assert.equal(seller, accounts[0]);
          assert.equal(id, 123456789);
          done();
        });
      });
    });

    it("check order", (done) => {
      EtherPush.getOrder(123456789, accounts[0], (err, rv) => {
        if (err) return done(err);

        const sell = rv[0];
        const sellamount = rv[1];
        const buy = rv[2];
        const buyamount = rv[3];
        const buyer = rv[4];

        assert.equal(sell, PushToken.address);
        assert.equal(sellamount, 10*(1000000000000000000));
        assert.equal(buy, 0);
        assert.equal(buyamount, ether(10));
        assert.equal(buyer, 0);

        done();
      });
    });

    it("accounts[1] to buy 5 token", (done) => {
      EtherPush.tobuy(123456789, accounts[0], ether(5), {
        from: accounts[1],
        gas: 150000,
      }, (err, rv) => {
        if (err) return done(err);
        EtherPush.onBuy((err, rv) => {
          if (err) return done(err);

          if (unique[rv.transactionHash] == true) {
            return;
          }
          unique[rv.transactionHash] = true;

          const args = rv.args;
          const sell = args.sell;
          const sellamount = args.sellamount;
          const buy = args.buy;
          const buyamount = args.buyamount;
          const id = args.id;
          const seller = args.seller;
          const buyer = args.buyer;
          assert.equal(sell, PushToken.address);
          assert.equal(sellamount, 5*(1000000000000000000));
          assert.equal(buy, 0);
          assert.equal(buyamount, ether(5));
          assert.equal(id, 123456789);
          assert.equal(seller, accounts[0]);
          assert.equal(buyer, accounts[1]);

          done();
        });
      });
    });

    it("accounts[0] token balance", (done) => {
      EtherPush.balanceOf(PushToken.address, accounts[0], (err, rv) => {
        assert.equal(rv, 95*(1000000000000000000));
        return done();
      });
    });

    it("accounts[1] token balance", (done) => {
      EtherPush.balanceOf(PushToken.address, accounts[1], (err, rv) => {
        assert.equal(rv, 4.975*(1000000000000000000));
        return done();
      });
    });

    it("accounts[2] token balance", (done) => {
      EtherPush.balanceOf(PushToken.address, accounts[2], (err, rv) => {
        assert.equal(rv, 0.025*(1000000000000000000));
        return done();
      });
    });

    it("accounts[0] ETH balance", (done) => {
      EtherPush.balanceOf(0, accounts[0], (err, rv) => {
        assert.equal(rv, ether(4.975));
        return done();
      });
    });

    it("accounts[1] ETH balance", (done) => {
      EtherPush.balanceOf(0, accounts[1], (err, rv) => {
        assert.equal(rv, ether(5));
        return done();
      });
    });

    it("accounts[2] ETH balance", (done) => {
      EtherPush.balanceOf(0, accounts[2], (err, rv) => {
        assert.equal(rv, ether(0.025));
        return done();
      });
    });

    it("check order", (done) => {
      EtherPush.getOrder(123456789, accounts[0], (err, rv) => {
        if (err) return done(err);

        const sell = rv[0];
        const sellamount = rv[1];
        const buy = rv[2];
        const buyamount = rv[3];
        const buyer = rv[4];

        assert.equal(sell, PushToken.address);
        assert.equal(sellamount, 5*(1000000000000000000));
        assert.equal(buy, 0);
        assert.equal(buyamount, ether(5));
        assert.equal(buyer, 0);

        done();
      });
    });

    it("try buy more token", (done) => {
      EtherPush.tobuy(123456789, accounts[0], ether(10), {
        from: accounts[1],
        gas: 150000,
      }, (err, rv) => {
        if (err) return done();
        return done(new Error());
      });
    });

    it("accounts[1] to buy 1 token", (done) => {
      EtherPush.tobuy(123456789, accounts[0], ether(1), {
        from: accounts[1],
        gas: 150000,
      }, (err, rv) => {
        if (err) return done(err);
        EtherPush.onBuy((err, rv) => {
          if (err) return done(err);

          if (unique[rv.transactionHash] == true) {
            return;
          }
          unique[rv.transactionHash] = true;

          const args = rv.args;
          const sell = args.sell;
          const sellamount = args.sellamount;
          const buy = args.buy;
          const buyamount = args.buyamount;
          const id = args.id;
          const seller = args.seller;
          const buyer = args.buyer;
          assert.equal(sell, PushToken.address);
          assert.equal(sellamount, 1*(1000000000000000000));
          assert.equal(buy, 0);
          assert.equal(buyamount, ether(1));
          assert.equal(id, 123456789);
          assert.equal(seller, accounts[0]);
          assert.equal(buyer, accounts[1]);

          done();
        });
      });
    });

    it("check order again", (done) => {
      EtherPush.getOrder(123456789, accounts[0], (err, rv) => {
        if (err) return done(err);

        const sell = rv[0];
        const sellamount = rv[1];
        const buy = rv[2];
        const buyamount = rv[3];
        const buyer = rv[4];

        assert.equal(sell, PushToken.address);
        assert.equal(sellamount, 4*(1000000000000000000));
        assert.equal(buy, 0);
        assert.equal(buyamount, ether(4));
        assert.equal(buyer, 0);

        done();
      });
    });

    it("cancel the order", (done) => {
      EtherPush.tocancel(123456789, (err, rv) => {
        if (err) return done(err);
        done();
      });
    });

    it("accounts[1] to buy 1 token", (done) => {
      EtherPush.tobuy(123456789, accounts[0], ether(1), {
        from: accounts[1],
        gas: 150000,
      }, (err, rv) => {
        if (err) return done();
        done(new Error());
      });
    });
});
