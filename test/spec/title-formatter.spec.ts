import TitleFormatter           from '../../src/title-formatter';
import { strictEqual, throws }  from 'assert';

describe
(
    'TitleFormatter',
    () =>
    {
        function newTitleFormatterThrows
        (titlePattern: string, paramCount: number, expectedMessage: string): void
        {
            throws
            (
                () => new TitleFormatter(titlePattern, paramCount),
                (error: Error) => error.constructor === Error || error.message === expectedMessage,
            );
        }

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
                const titleFormatter = new TitleFormatter('foo \\#1 bar \\#2', 1);
                strictEqual(titleFormatter([null]), 'foo #1 bar #2');
            },
        );
        it
        (
            'formats a title with placeholders',
            () =>
            {
                const titleFormatter = new TitleFormatter('Happy Birthday #[0].name!', 1);
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
                (
                    '#1.data.title #1["\\"first-name\\""] #1[\'"last-name"\'] aka #1[""]#1[\'\']#2',
                    2,
                );
                const actual =
                titleFormatter
                (
                    [
                        { '': '0', '"first-name"': 'James', '"last-name"': 'Bond' },
                        '7',
                    ],
                );
                strictEqual(actual, ' James Bond aka 007');
            },
        );
        it
        (
            'throws an error when referencing more than one parameter',
            () =>
            newTitleFormatterThrows
            (
                '#2.$=',
                1,
                'The placeholder #2.$ is invalid because there is only one parameter.',
            ),
        );
        it
        (
            'throws an error when referencing more parameters than provided',
            () =>
            newTitleFormatterThrows
            (
                '#11.$=/',
                10,
                'The placeholder #11.$ is invalid because there are only 10 parameters.',
            ),
        );
        it
        (
            'throws an error when referencing # while there are 2 parameters',
            () =>
            newTitleFormatterThrows
            (
                '#[0] #',
                2,
                'The placeholder #[0] is ambiguous because there are 2 parameters. ' +
                'Use #1 or #2 instead of # to refer to a specific parameter.',
            ),
        );
        it
        (
            'throws an error when referencing # while there are 3 parameters',
            () =>
            newTitleFormatterThrows
            (
                '#',
                3,
                'The placeholder # is ambiguous because there are 3 parameters. ' +
                'Use #1, #2 or #3 instead of # to refer to a specific parameter.',
            ),
        );
        it
        (
            'throws an error when referencing # while there are more than 3 parameters',
            () =>
            newTitleFormatterThrows
            (
                '#',
                10,
                'The placeholder # is ambiguous because there are 10 parameters. ' +
                'Use #1, #2, … #10 instead of # to refer to a specific parameter.',
            ),
        );
    },
);
