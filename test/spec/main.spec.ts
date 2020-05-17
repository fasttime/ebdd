import { ebdd }                             from '../../src/ebdd';
import { strictEqual, throws }              from 'assert';
import postrequire, { PostrequireStubs }    from 'postrequire';

function requireMain(stubs?: Readonly<Partial<PostrequireStubs>>): unknown
{
    const returnValue = postrequire('../../src/main', stubs) as unknown;
    return returnValue;
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
                throws(() => requireMain({ module: undefined }), Error);
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
