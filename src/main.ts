import ebdd from './ebdd';

function defineMocha(attributes: PropertyDescriptor): void
{
    Object.defineProperty(self, 'Mocha', attributes);
}

function registerUI(): void
{
    Mocha.interfaces.ebdd = ebdd;
}

let installed = false;
if (typeof module !== 'undefined')
{
    module.exports = ebdd;
    installed = true;
}
if (typeof self !== 'undefined')
{
    if ((self as { Mocha?: unknown; }).Mocha !== undefined)
        registerUI();
    else
    {
        defineMocha
        (
            {
                set:
                (value: unknown): void =>
                {
                    if (value !== undefined)
                    {
                        defineMocha({ value, writable: true, enumerable: true });
                        registerUI();
                    }
                },
                configurable: true,
            },
        );
    }
    installed = true;
}
if (!installed)
{
    const message = 'EBDD failed to set up because no Node.js or browser environment was detected.';
    throw Error(message);
}
