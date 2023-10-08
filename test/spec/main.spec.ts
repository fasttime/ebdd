import ebdd                                     from '../../src/ebdd';
import { strictEqual, throws }                  from 'assert';
import postrequire, { type PostrequireStubs }   from 'postrequire';

function requireMain(stubs?: Readonly<Partial<PostrequireStubs>>): unknown
{
    const returnValue = postrequire('../../src/main', stubs) as unknown;
    return returnValue;
}

describe
(
    'EBDD registration',
    (): void =>
    {
        it
        (
            'in an unsupported environment',
            function (): void
            {
                if (typeof self !== 'undefined')
                    this.skip();
                throws((): unknown => requireMain({ module: undefined }), Error);
            },
        );

        it
        (
            'in Node.js',
            function (): void
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
            (): void =>
            {
                function clearGlobals(): void
                {
                    delete (self as typeof self & { Mocha: unknown; }).Mocha;
                    delete (global as typeof global | { self: unknown; }).self;
                }

                function mockSelfIfUndefined(): void
                {
                    (global as typeof global | { self: unknown; }).self = global;
                }

                it
                (
                    'before Mocha is defined',
                    (): void =>
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
                    (): void =>
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
