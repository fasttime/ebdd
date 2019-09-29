// Dummy Uint8Array polyfill to allow loading Mocha 6 in Internet Explorer 9 and 10.

/* eslint-env browser */

'use strict';

(function ()
{
    if (!('Uint8Array' in self))
    {
        var Uint8Array =
        function ()
        {
        };

        Object.defineProperty
        (self, 'Uint8Array', { value: Uint8Array, writable: true, configurable: true });
    }
}
)();
