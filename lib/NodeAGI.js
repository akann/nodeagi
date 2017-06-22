
class NodeAGI {
    constructor() {
        this.anyDigit = '0123456789#*';
        this.OK = '200';
        this.agi = '';
        this.state = {
            AST_STATE_DOWN: 0,
            AST_STATE_RESERVED: 1,
            AST_STATE_OFFHOOK: 2,
            AST_STATE_DIALING: 3,
            AST_STATE_RING: 4,
            AST_STATE_RINGING: 5,
            AST_STATE_UP: 6,
            AST_STATE_BUSY: 7,
            AST_STATE_DIALING_OFFHOOK: 8,
            AST_STATE_PRERING: 9
        };

        (() => {
          process.stdin.setEncoding('utf8');
        })();
    }

    answer() {
      const self = this;
      return this._sendCommand('ANSWER').then(data => {
                if (!self.agi) {
                  self.agi = data.agi;
                }

                return data;
             });
    }

    getData(fileName, timeout, maxDigits) {
      return this._sendCommand(`GET DATA ${timeout} ${maxDigits}`);
    }

    fastPassGetData(fileName, timeout=5, maxDigits=20, callback) {
      const digits = [];
      let chain = Promise.resolve();
      let i;

      for(i=0; i<maxDigits; i++) {
        if (callback) {
          chain = chain.then(() => this.getData(fileName, timeout, 1)
                                        .then(data => {
                                          digits.push(data.result);
                                          return data;
                                        })
                                        .then(data => callback(data, digits))
          );
        } else {
          chain = chain.then(() => this.getData(fileName, timeout, 1)
                                        .then(data => digits.push(data.result))
          );
        }
      }

      return chain.then(() => ({result: digits.join('')}));

    }

    _parseResult(result) {
      const data = {result: '', status: '', value: '', agi: ''};

      return result.split(/\n/)
        .map(part => part.trim())
        .filter(part => Boolean(part))
        .reduce( (out, curr) => {
          let m;
          if(m = curr.match(/(\d+)\s+result=(.*)\((.+)\)$/)) {
            out.status = m[1];
            out.result = m[2].trim();
            out.value = m[3];
          } else if(m = curr.match(/(\d+)\s+result=(.*)$/)) {
            out.status = m[1];
            out.result = m[2].trim();
          }

          return out;
        }, data);
    }

    _sendCommand(cmd) {
      const promises = [
        process.stdout.write(`${input}\n`),

        new Promise(resolve => {
          process.stdin.on('data', chunk => resolve(chunk));
        })
      ];

      return Promise.all(promises)
        .then(data => Object.assign({},
                          _parseResult(data[1]),
                          {cmd: input},
                          {raw: data[1].trim()}
                      )
        )
    }

}

module.exports = NodeAGI;
