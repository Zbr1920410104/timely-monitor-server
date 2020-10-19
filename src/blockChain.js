const sha256 = require('crypto-js/sha256');
const sm3 = require('sm-crypto').sm3;
const ecLib = require('elliptic').ec;
const ec = new ecLib('sm2'); // curve name
// 需要签名的是什么 是transaction
// 签名transaction这个数据本什么，不，签名他的hash
// 为什么要签名hash ...
// 需要外人能够verify这个transaction
class Transaction {
  constructor(from, to, amount) {
    this.from = from;
    this.to = to;
    this.amount = new Number(amount).toFixed(8);
    // this.timestamp = timestamp;
  }

  computeHash() {
    return sha256(this.from + this.to + this.amount).toString();
  }

  // 签名需要private key
  sign(privateKey) {
    // 验证你拥有这笔钱。privateKey和fromAddress对应的上
    this.signature = privateKey.sign(this.computeHash(), 'base64').toDER('hex');
  }

  isValid() {
    // from Address 就是public key
    // 有两种类型的 transaction
    if (this.from === null || this.from === '') return true;
    if (!this.signature) {
      throw new Error('sig missing');
    }
    const publicKey = ec.keyFromPublic(this.from, 'hex');
    return publicKey.verify(this.computeHash(), this.signature);
  }
}

class Block {
  constructor(transactions, previousHash, index) {
    // data 是 string
    // data -> transaction <-> array of objects
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.timestamp = Date.now();
    this.nonce = 1;
    this.hash = this.computeHash();
    this.index = index;
  }

  computeHash() {
    // data 需要 stringify
    // JSON.stringify
    return sha256(
      JSON.stringify(this.transactions) +
        this.previousHash +
        this.nonce +
        this.timestamp
    ).toString();
  }

  getAnswer(difficulty) {
    //开头前n位为0的hash
    let answer = '';
    for (let i = 0; i < difficulty; i++) {
      answer += '0';
    }
    return answer;
  }
  //计算复合区块链难度要求的hash
  // 什么是 复合区块链难度要求的hash
  mine(difficulty) {
    if (!this.validateTransactions()) {
      throw new Error(
        'tampered transactions found, abort, 发现异常交易，停止挖矿'
      );
    }
    while (true) {
      this.hash = this.computeHash();
      if (this.hash.substring(0, difficulty) !== this.getAnswer(difficulty)) {
        this.nonce++;
        this.hash = this.computeHash();
      } else {
        break;
      }
    }
    console.log('挖矿结束', this.hash);
  }

  //在block里验证这所有的transactions
  validateTransactions() {
    const isValid = (from, to, amount, signature) => {
      // from Address 就是public key
      // 有两种类型的 transaction
      if (from === null || from === '') return true;
      if (!signature) {
        throw new Error('sig missing');
      }
      const publicKey = ec.keyFromPublic(from, 'hex');
      const hash = sha256(from + to + amount).toString();
      return publicKey.verify(hash, signature);
    };
    for (let transaction of this.transactions) {
      if (
        !isValid(
          transaction.from,
          transaction.to,
          transaction.amount,
          transaction.signature
        )
      ) {
        console.log('非法交易');
        return false;
      }
    }
    return true;
  }
}

// 区块 的 链
// 生成祖先区块
class Chain {
  constructor(difficulty) {
    this.chain = [this.bigBang()];
    this.transactionPool = [];
    this.minerReward = 50;
    this.difficulty = difficulty;
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
  }

  bigBang() {
    const genesisBlock = new Block(
      [
        {
          from: null,
          to:
            '047437e0b581ce2dae8a44d1bac9d62d110fcbf46d8fd51798da7958a40c7a5da26eebce044e5d424f161aff9e119096b394d802b66559cfab03499cb46daede14',
          amount: 50,
        },
      ],
      '0',
      0
    );
    return genesisBlock;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // 添加transaction 到 transactionPool里
  // 验证transaction 的合法性
  // 暴露给外部的方法不应该允许添加空地址的transaction
  addTransaction(transaction) {
    if (!transaction.from || !transaction.to)
      throw new Error('invalid from or to');

    if (!transaction.isValid())
      throw new Error('invalid transaction, tampered or invalid sig');

    this.transactionPool.push(transaction);
  }

  mineTransactionPool(minerRewardAddress) {
    // 发放矿工奖励
    const minerRewardTransaction = new Transaction(
      null,
      minerRewardAddress,
      this.minerReward
    );
    this.transactionPool.push(minerRewardTransaction);

    // 挖矿
    const newBlock = new Block(
      this.transactionPool,
      this.getLatestBlock().hash,
      this.chain.length
    );
    newBlock.mine(this.difficulty);

    // 添加区块到区块链
    // 清空 transaction Pool
    this.chain.push(newBlock);
    this.transactionPool = [];
  }

  //验证这个当前的区块链是否合法
  //当前的数据有没有被篡改
  //我们要验证区块的previousHash是否等于previous区块的hash

  // validate all the transactions
  validateChain() {
    if (this.chain.length === 1) {
      if (this.chain[0].hash !== this.chain[0].computeHash()) {
        return false;
      }
      return true;
    }
    // this.chain[1] 是第二个区块
    // 我们从第二个区块开始 验证
    // 验证到最后一个区块 this.chain.length -1
    for (let i = 1; i <= this.chain.length - 1; i++) {
      const blockToValidate = this.chain[i];
      // block的transactions均valid
      if (!blockToValidate.validateTransactions()) {
        console.log('非法交易');
        return false;
      }
      //当前的数据有没有被篡改
      if (blockToValidate.hash !== blockToValidate.computeHash()) {
        console.log('数据篡改');
        return false;
      }
      console.log(this.chain);
      //我们要验证区块的previousHash是否等于previous区块的hash
      const previousBlock = this.chain[i - 1];
      if (blockToValidate.previousHash !== previousBlock.hash) {
        console.log('前后区块链接断裂');
        return false;
      }
    }
    return true;
  }
}

module.exports = { Chain, Transaction, Block };
