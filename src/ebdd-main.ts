import { ebdd } from './mocha-interface';

if (typeof module !== 'undefined')
    module.exports = ebdd;
if (typeof Mocha === 'function')
    Mocha.interfaces.ebdd = ebdd;
