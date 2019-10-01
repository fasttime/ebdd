/* eslint-env node */

'use strict';

var assert  = require('assert');
var sinon   = require('../node-test/node_modules/sinon');

(function ()
{
    if (!('deepStrictEqual' in assert))
        assert.deepStrictEqual = assert.deepEqual;
    sinon.createSandbox =
    function ()
    {
        return sinon.sandbox.create();
    };
    var spy = sinon.spy;
    sinon.spy =
    function ()
    {
        var returnValue = spy.apply(this, arguments);
        returnValue.resetHistory =
        function ()
        {
            this.reset();
        };
        return returnValue;
    };
    var stub = sinon.stub;
    sinon.stub =
    function ()
    {
        var returnValue = stub.apply(this, arguments);
        returnValue.calledOnceWithExactly =
        function ()
        {
            var returnValue = this.calledOnce && this.calledWithExactly.apply(this, arguments);
            return returnValue;
        };
        return returnValue;
    };
}
)();
