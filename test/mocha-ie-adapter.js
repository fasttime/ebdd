// Dummy Uint8Array polyfill to allow loading Mocha 6 in Internet Explorer 9 and 10.

/* eslint-env browser */

'use strict';

(function ()
{
    [
        'Float32Array',
        'Float64Array',
        'Int16Array',
        'Int32Array',
        'Int8Array',
        'Map',
        'Set',
        'Uint16Array',
        'Uint32Array',
        'Uint8Array',
        'Uint8ClampedArray',
    ]
    .forEach
    (
        function (name)
        {
            if (!(name in self))
            {
                var value =
                function ()
                {
                };

                Object.defineProperty
                (self, name, { value: value, writable: true, configurable: true });
            }
        }
    );
}
)();
