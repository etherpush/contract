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

    it("fee shoule be 1% at default", (done) => {
      EtherPush.getFee((err, rv) => {
          if (err) return done(err);
          assert.equal(rv, 10000);
          done();
      });
    });

    it("feeDivide should be 1000000 at default", (done) => {
      EtherPush.feeDivide((err, rv) => {
          if (err) return done(err);
          assert.equal(rv, 1000000);
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
          if (err) return done();
          return done();
        });
      });
    });

    it("volume should be 0 at default", (done) => {
      EtherPush.getVolume((err, rv) => {
          if (err) return done(err);
          assert.equal(rv, 0);
          done();
      });
    });

    it("user can't change fee", (done) => {
      EtherPush.ownerChangeFee(10000, {from: accounts[1]}, (err, rv) => {
        if (err) return done();
        return done(new Error());
      });
    });

    it("owner can change fee", (done) => {
      EtherPush.ownerChangeFee(10000, {from: accounts[0]}, (err, rv) => {
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

    it("Push token", (done) => {
      /*
       * before push token, we should approve token to EtherPush
       */
      PushToken.approve(EtherPush.address, 100*(1000000000000000000), (err, rv) => {
        if (err) return done(err);
        /*
         * Now let's push
         */
        EtherPush.push(PushToken.address, 100*(1000000000000000000), 1, 123456789, {
          from: accounts[0],
          gas: 200000,
        }, (err, rv) => {
          if (err) return done(err);
          EtherPush.onPush((err, rv) => {
            if (err) return done(err);

            if (unique[rv.transactionHash] == true) {
              return;
            }
            unique[rv.transactionHash] = true;

            const args = rv.args;
            const token = args.token;
            const amount = args.amount;
            const price = args.price;
            const id = args.id;
            assert.equal(token, PushToken.address);
            assert.equal(amount, 100*(1000000000000000000));
            assert.equal(price, 1);
            assert.equal(id, 123456789);
            return done();
          })
        });
      });
    });

    it("Buy token", (done) => {
      EtherPush.buy(PushToken.address, accounts[0], 123456789, {
        from: accounts[1],
        value: ether(10),
        gas: 200000
      }, (err, rv) => {
        if (err) return done(err);
        EtherPush.onBuy((err, rv) => {
          if (err) return done(err);

          if (unique[rv.transactionHash] == true) {
            return;
          }
          unique[rv.transactionHash] = true;

          const args = rv.args;
          const seller = args.seller;
          const buyer = args.buyer;
          const amount = args.amount;
          const price = args.price;

          assert.equal(seller, accounts[0]);
          assert.equal(buyer, accounts[1]);
          assert.equal(amount, 9.9 * (1000000000000000000));
          assert.equal(price, 1);

          return done();
        });
      });
    });

    it("check push remaing", (done) => {
      EtherPush.amountAndPriceOf(PushToken.address, accounts[0], 123456789, (err, rv) => {
        if (err) return done(err);
        const amount = rv[0];
        const price = rv[1];

        assert.equal(amount, (100-9.9)*(1000000000000000000));
        assert.equal(price, 1);

        return done();
      });
    });

    it("cancel remaing push", (done) => {
      EtherPush.cancel(PushToken.address, 123456789, (err, rv) => {
        if (err) return done(err);
        EtherPush.amountAndPriceOf(PushToken.address, accounts[0], 123456789, (err, rv) => {
          if (err) return done(err);
          const amount = rv[0];
          const price = rv[1];

          assert.equal(amount, 0);
          assert.equal(price, 1);

          return done();
        });
      });
    });

    it("check accounts[0] token", (done) => {
      EtherPush.balanceOf(PushToken.address, accounts[0], (err, rv) => {
        if (err) return done(err);

        assert.equal(rv, (100-9.9)*(1000000000000000000));
        return done();
      });
    });

    it("check accounts[0] ETH balance", (done) => {
      EtherPush.balanceOf(0, accounts[0], (err, rv) => {
        if (err) return done(err);

        assert.equal(rv, ether(9.9));
        return done();
      });
    });

    it("check accounts[1] token", (done) => {
      EtherPush.balanceOf(PushToken.address, accounts[1], (err, rv) => {
        if (err) return done(err);

        assert.equal(rv, 9.9*(1000000000000000000));
        return done();
      });
    });

    it("volume should be right", (done) => {
      EtherPush.getVolume((err, rv) => {
        if (err) return done(err);
        assert.equal(rv, ether(10));
        return done();
      });
    });

    it("accounts[0] withdraw amount 4 ETH", (done) => {
        EtherPush.withdrawAmountETH(ether(4), {
          from:accounts[0]
        },
          (err, rv) => {
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
              assert.equal(user, accounts[0]);
              assert.equal(amount, ether(4));
              assert.equal(balance, ether(5.9));

              return done();
            });
        });
    });

    it("accounts[0] withdraw amount all ETH", (done) => {
        EtherPush.withdrawETH({
          from:accounts[0]
        },
          (err, rv) => {
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
              assert.equal(user, accounts[0]);
              assert.equal(amount, ether(5.9));
              assert.equal(balance, ether(0));

              return done();
            });
        });
    });

    it("accounts[0] withdraw amount 4 token", (done) => {
      EtherPush.withdrawAmountToken(PushToken.address, 4*(1000000000000000000), {
        from: accounts[0],
      },(err, rv) => {
        if (err) return done(err);

        EtherPush.onWithdraw((err, rv) => {
          if (err) {
            return done(err);
          }

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
          assert.equal(amount, (4)* 1000000000000000000);
          assert.equal(balance,(86.1) * 1000000000000000000);

          return done();
        });
      });
    });

    it("accounts[0] withdraw all token", (done) => {
      EtherPush.withdrawToken(PushToken.address, {
        from: accounts[0],
      },(err, rv) => {
        if (err) return done(err);

        EtherPush.onWithdraw((err, rv) => {
          if (err) {
            return done(err);
          }

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
          assert.equal(amount, (86.1)* 1000000000000000000);
          assert.equal(balance, 0);

          return done();
        });
      });
    });

    it("accounts[1] withdraw amount 4 token", (done) => {
      EtherPush.withdrawAmountToken(PushToken.address, 4*(1000000000000000000), {
        from: accounts[1],
      },(err, rv) => {
        if (err) return done(err);

        EtherPush.onWithdraw((err, rv) => {
          if (err) {
            return done(err);
          }

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
          assert.equal(user, accounts[1]);
          assert.equal(amount, (4)* 1000000000000000000);
          assert.equal(balance,(5.9) * 1000000000000000000);

          return done();
        });
      });
    });

    it("accounts[1] withdraw all token", (done) => {
      EtherPush.withdrawToken(PushToken.address, {
        from: accounts[1],
      },(err, rv) => {
        if (err) return done(err);

        EtherPush.onWithdraw((err, rv) => {
          if (err) {
            return done(err);
          }

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
          assert.equal(user, accounts[1]);
          assert.equal(amount, (5.9)* 1000000000000000000);
          assert.equal(balance, 0);

          return done();
        });
      });
    });

    it("check etherpush balance", (done) => {
      web3.eth.getBalance(EtherPush.address, (err, rv) => {
        if (err) return done(err);
        assert.equal(rv, ether(0.1));
        return done();
      });
    });

    it("owner withdraw etherpush to another account", (done) => {
      web3.eth.getBalance(accounts[2], (err, rv) => {
        if (err) return done(err);
        const balance2 = rv;
        EtherPush.ownerWithdrawAccount(accounts[2], {
          from: accounts[0],
        }, (err, rv) => {
          if (err) return done(err);
          web3.eth.getBalance(accounts[2], (err, rv) => {
            if (err) return done(err);
            assert(rv.equals(balance2.add(ether(0.1))));
            return done();
          });
        });
      });
    });

    it("check etherpush balance", (done) => {
      web3.eth.getBalance(EtherPush.address, (err, rv) => {
        if (err) return done(err);
        assert.equal(rv, ether(0));
        return done();
      });
    });

    it("check accounts[1] token", (done) => {
      EtherPush.balanceOf(PushToken.address, accounts[1], (err, rv) => {
        if (err) return done(err);

        assert.equal(rv, 0);
        return done();
      });
    });

    it("check accounts[0] token", (done) => {
      EtherPush.balanceOf(PushToken.address, accounts[0], (err, rv) => {
        if (err) return done(err);

        assert.equal(rv, 0);
        return done();
      });
    });

    it("check accounts[0] ETH balance", (done) => {
      EtherPush.balanceOf(0, accounts[0], (err, rv) => {
        if (err) return done(err);

        assert.equal(rv, 0);
        return done();
      });
    });

    it("check accounts[1] token", (done) => {
      EtherPush.balanceOf(PushToken.address, accounts[1], (err, rv) => {
        if (err) return done(err);

        assert.equal(rv, 0);
        return done();
      });
    });

    it("check accounts[1] ETH balance", (done) => {
      EtherPush.balanceOf(0, accounts[1], (err, rv) => {
        if (err) return done(err);

        assert.equal(rv, 0);
        return done();
      });
    });

    it("owner change running to false", (done) => {
      EtherPush.ownerChangeRunning(false, {from:accounts[0]}, (err, rv) => {
        if (err) return done();
        return done();
      });
    });

    it("Cannot Push token when it's not running", (done) => {
      /*
       * before push token, we should approve token to EtherPush
       */
      PushToken.approve(EtherPush.address, 100*(1000000000000000000), (err, rv) => {
        if (err) return done(err);
        /*
         * Now let's push
         */
        EtherPush.push(PushToken.address, 100*(1000000000000000000), 1, 123456789, {
          from: accounts[0],
          gas: 200000,
        }, (err, rv) => {
          if (err) return done();
          return done();
        });
      });
    });

    it("owner change running to true", (done) => {
      EtherPush.ownerChangeRunning(true, {from:accounts[0]}, (err, rv) => {
        if (err) return done();
        return done();
      });
    });

    it("Push token Again", (done) => {
      /*
       * before push token, we should approve token to EtherPush
       */
      PushToken.approve(EtherPush.address, 10*(1000000000000000000), (err, rv) => {
        if (err) return done(err);
        /*
         * Now let's push
         */
        EtherPush.push(PushToken.address, 10*(1000000000000000000), 1, 23456789, {
          from: accounts[0],
          gas: 200000,
        }, (err, rv) => {
          if (err) return done(err);
          EtherPush.onPush((err, rv) => {
            if (err) return done(err);

            if (unique[rv.transactionHash] == true) {
              return;
            }
            unique[rv.transactionHash] = true;

            const args = rv.args;
            const token = args.token;
            const amount = args.amount;
            const price = args.price;
            const id = args.id;
            assert.equal(token, PushToken.address);
            assert.equal(amount, 10*(1000000000000000000));
            assert.equal(price, 1);
            assert.equal(id, 23456789);
            return done();
          })
        });
      });
    });

    it("Buy excessive token", (done) => {
      EtherPush.buy(PushToken.address, accounts[0], 23456789, {
        from: accounts[1],
        value: ether(20),
        gas: 200000
      }, (err, rv) => {
        if (err) return done();
        return done(new Error());
      });
    });
});
