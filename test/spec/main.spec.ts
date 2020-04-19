import { ebdd }                 from '../../src/ebdd';
import { strictEqual, throws }  from 'assert';
import postrequire              from 'postrequire';

function requireMain(): unknown
{
    try
    {
        const returnValue = postrequire('../../src/main') as unknown;
        return returnValue;
    }
    finally
    {
        // Very old versions of Node.js unexpectedly define the global "paths".
        delete (global as NodeJS.Global & { paths: unknown; }).paths;
    }
}

function requireMainWithoutModule(): unknown
{
    function doApply(fn: Function, thisValue: Function, args: unknown[]): unknown
    {
        if (fn.length === 5 && fn.name === '')
        {
            args[2] = undefined;
            prototype.apply = apply;
            prototype.call = call;
        }
        const returnValue =
        (apply as (thisArg: any, args: any[]) => unknown).bind(fn)(thisValue, args);
        return returnValue;
    }

    const { prototype } = Function;
    const { apply, call } = prototype;
    prototype.apply =
    function (this: Function, thisValue: Function, args: unknown[]): unknown
    {
        const returnValue = doApply(this, thisValue, args);
        return returnValue;
    };
    prototype.call =
    function (thisValue: Function, ...args: unknown[]): unknown
    {
        const returnValue = doApply(this, thisValue, args);
        return returnValue;
    };
    try
    {
        const returnValue = requireMain();
        return returnValue;
    }
    finally
    {
        prototype.apply = apply;
        prototype.call = call;
    }
}

describe
(
    'EBDD registration',
    () =>
    {
        it
        (
            'in an unsupported environment',
            function ()
            {
                if (typeof self !== 'undefined')
                    this.skip();
                throws(requireMainWithoutModule, Error);
            },
        );

        it
        (
            'in Node.js',
            function ()
            {
                if (typeof self !== 'undefined')
                    this.skip();
                const actual = requireMain();
                strictEqual(actual, ebdd);
            },
        );

        describe
        (
            'in a browser',
            () =>
            {
                function clearGlobals(): void
                {
                    delete (self as Window & typeof globalThis & { Mocha: unknown; }).Mocha;
                    delete (global as NodeJS.Global & { self: unknown; }).self;
                }

                function mockSelfIfUndefined(): void
                {
                    (global as NodeJS.Global & { self: unknown; }).self = global;
                }

                it
                (
                    'before Mocha is defined',
                    () =>
                    {
                        mockSelfIfUndefined();
                        try
                        {
                            requireMain();
                            (self as Window & typeof globalThis & { Mocha: unknown; }).Mocha =
                            undefined;
                            (self as Window & typeof globalThis & { Mocha: unknown; }).Mocha =
                            { interfaces: { } };
                            const actual = Mocha.interfaces.ebdd;
                            strictEqual(actual, ebdd);
                        }
                        finally
                        {
                            clearGlobals();
                        }
                    },
                );

                it
                (
                    'after Mocha is defined',
                    () =>
                    {
                        try
                        {
                            mockSelfIfUndefined();
                            (self as Window & typeof globalThis & { Mocha: unknown; }).Mocha =
                            { interfaces: { } };
                            requireMain();
                            const actual = Mocha.interfaces.ebdd;
                            strictEqual(actual, ebdd);
                        }
                        finally
                        {
                            clearGlobals();
                        }
                    },
                );
            },
        );
    },
);
