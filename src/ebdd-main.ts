import { MochaConstructor, initEBDD } from './mocha-interface';

let mochaConstructor: MochaConstructor;
if (typeof Mocha === 'function')
    mochaConstructor = Mocha as any;
else if (typeof require === 'function')
    mochaConstructor = require('mocha');
else
    throw Error('Mocha not found.');
const ebdd = initEBDD(mochaConstructor);
if (typeof module !== 'undefined')
    module.exports = ebdd;
