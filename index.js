#!/root/.nvm/versions/node/v7.8.0/bin/node
// #!/home/akan/.nvm/versions/node/v8.1.2/bin/node

const path   = require('path');
const fs = require('fs');

process.stdin.setEncoding('utf8');

const parseResult = result => {
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
};

const getInput = input => {
    const promises = [
        process.stdout.write(`${input}\n`),

        new Promise(resolve => {
            process.stdin.on('data', chunk => resolve(chunk));
        })
    ];

    return Promise.all(promises)
        .then(data => Object.assign({}, parseResult(data[1]), {cmd: input}, {raw: data[1].trim()}));
}

getInput('ANSWER')
    .then( data => {
        fs.appendFileSync('/tmp/pagi.log', `\noutput: ${JSON.stringify(data, null, 2)}\n\n`, (err) => { });
    })

    .then( () => {
        const all = [];
        const inputs = [
            () => getInput('GET DATA demo-abouttotry 5 1').then(data => {all.push(data.result); return data.result}),
            (i) => getInput(`VERBOSE "Entered: ${i} => ${all.join('')}" 3`),
            () => getInput('GET DATA silence/5 1 1').then(data => {all.push(data.result); return data.result}),
            (i) => getInput(`VERBOSE "Entered: ${i} => ${all.join('')}" 3`),
            () => getInput('GET DATA silence/5 1 1').then(data => {all.push(data.result); return data.result}),
            (i) => getInput(`VERBOSE "Entered: ${i} => ${all.join('')}" 3`),
            () => getInput('GET DATA silence/5 1 1').then(data => {all.push(data.result); return data.result}),
            (i) => getInput(`VERBOSE "Entered: ${i} => ${all.join('')}" 3`),
            () => getInput('GET DATA silence/5 1 1').then(data => {all.push(data.result); return data.result}),
            (i) => getInput(`VERBOSE "Entered: ${i} => ${all.join('')}" 3`)
        ];

        let chain = Promise.resolve();

        for (const func of inputs) {
            chain = chain.then(func);
        }

        return chain.then(() => ({result: all.join('')}));

    })
    .then( data => {
        fs.appendFileSync('/tmp/pagi.log', `\noutput: ${JSON.stringify(data, null, 2)}\n\n`, (err) => { });
    })
    .then( () => getInput('GET DATA demo-abouttotry') )
    .then( data => {
        fs.appendFileSync('/tmp/pagi.log', `\noutput: ${JSON.stringify(data, null, 2)}\n\n`, (err) => { });
    })

    /**
     .then( () => getInput('GET VARIABLE UNIQUEID') )
     .then( data => {
  fs.appendFileSync('/tmp/pagi.log', `\noutput: ${JSON.stringify(data, null, 2)}\n\n`, (err) => { });
})

     .then( () => getInput('CHANNEL STATUS') )
     .then( data => {
  fs.appendFileSync('/tmp/pagi.log', `\noutput: ${JSON.stringify(data, null, 2)}\n\n`, (err) => { });
})
     .then( () => getInput('WAIT FOR DIGIT 5') )
     .then( data => {
  fs.appendFileSync('/tmp/pagi.log', `\noutput: ${JSON.stringify(data, null, 2)}\n\n`, (err) => { });
})
     .then( () => getInput('GET DATA demo-abouttotry') )
     .then( data => {
  fs.appendFileSync('/tmp/pagi.log', `\noutput: ${JSON.stringify(data, null, 2)}\n\n`, (err) => { });
})
     .then( () => getInput('SAY NUMBER 255666 0123456789*#') )
     .then( data => {
  fs.appendFileSync('/tmp/pagi.log', `\noutput: ${JSON.stringify(data, null, 2)}\n\n`, (err) => { });
})

     */

    .then( () => getInput('HANGUP') )
    .then( data => {
        fs.appendFileSync('/tmp/pagi.log', `\noutput: ${JSON.stringify(data, null, 2)}\n\n`, (err) => { });
    })
    .catch( (error) => fs.appendFileSync('/tmp/pagi.log', `error: ${error.message}\n`, (err) => { }) )
;
