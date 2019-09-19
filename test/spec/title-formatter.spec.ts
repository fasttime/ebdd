import TitleFormatter from '../../src/title-formatter';
import { strictEqual, throws } from 'assert';

describe
(
    'TitleFormatter',
    () =>
    {
        it
        (
            'formats an empty title',
            () =>
            {
                const titleFormatter = new TitleFormatter('', 1);
                strictEqual(titleFormatter([null]), '');
            },
        );
        it
        (
            'formats a title without placeholders',
            () =>
            {
                const titleFormatter = new TitleFormatter('foo', 1);
                strictEqual(titleFormatter([null]), 'foo');
            },
        );
        it
        (
            'formats a title with placeholders',
            () =>
            {
                const titleFormatter = new TitleFormatter('Happy Birthday @[0].name!', 1);
                strictEqual(titleFormatter([[{ name: 'ebdd' }]]), 'Happy Birthday ebdd!');
            },
        );
        it
        (
            'formats a title with placeholders',
            () =>
            {
                const titleFormatter =
                new TitleFormatter
                ('@1.data.title @1["\\"first-name\\""] @1[\'"last-name"\'] aka @2', 2);
                const actual =
                titleFormatter([{ '"first-name"': 'James', '"last-name"': 'Bond' }, '007']);
                strictEqual(actual, ' James Bond aka 007');
            },
        );
        it
        (
            'throws an error when referencing more than one parameter',
            () =>
            {
                throws
                (
                    () => new TitleFormatter('@2.$=', 1),
                    {
                        constructor: Error,
                        message:
                        'The placeholder @2.$ is invalid because there is only one parameter.',
                    },
                );
            },
        );
        it
        (
            'throws an error when referencing more parameters than provided',
            () =>
            {
                throws
                (
                    () => new TitleFormatter('@11.$=/', 10),
                    {
                        constructor: Error,
                        message:
                        'The placeholder @11.$ is invalid because there are only 10 parameters.',
                    },
                );
            },
        );
        it
        (
            'throws an error when referencing @ while there are 2 parameters',
            () =>
            {
                throws
                (
                    () => new TitleFormatter('@[0] @', 2),
                    {
                        constructor: Error,
                        message:
                        'The placeholder @[0] is ambiguous because there are 2 parameters. ' +
                        'Use @1 or @2 instead of @ to refer to a specific parameter.',
                    },
                );
            },
        );
        it
        (
            'throws an error when referencing @ while there are 3 parameters',
            () =>
            {
                throws
                (
                    () => new TitleFormatter('@', 3),
                    {
                        constructor: Error,
                        message:
                        'The placeholder @ is ambiguous because there are 3 parameters. ' +
                        'Use @1, @2 or @3 instead of @ to refer to a specific parameter.',
                    },
                );
            },
        );
        it
        (
            'throws an error when referencing @ while there are more than 3 parameters',
            () =>
            {
                throws
                (
                    () => new TitleFormatter('@', 10),
                    {
                        constructor: Error,
                        message:
                        'The placeholder @ is ambiguous because there are 10 parameters. ' +
                        'Use @1, @2, … @10 instead of @ to refer to a specific parameter.',
                    },
                );
            },
        );
    },
);
