type Chunk = Placeholder | string;

interface Placeholder extends ReadonlyArray<string>
{
    readonly start:         number;
    readonly end:           number;
    readonly paramIndex:    number;
}

interface TitleFormatter
{
    (params: readonly unknown[]): string;
}

class TitleFormatter
{
    public constructor(titlePattern: string, paramCount: number)
    {
        function titleFormatter(params: readonly unknown[]): string
        {
            function formatChunk(chunk: Chunk): unknown
            {
                if (typeof chunk === 'string')
                    return chunk;
                let value = params[chunk.paramIndex];
                for (const propName of chunk)
                {
                    if (value === undefined || value === null)
                        return undefined;
                    value = (value as any)[propName];
                }
                return value;
            }

            const title = chunks.map(formatChunk).join('');
            return title;
        }

        const chunks = createChunks(titlePattern, paramCount);
        return titleFormatter;
    }
}

function createChunks(titlePattern: string, paramCount: number): readonly Chunk[]
{
    function findNextPlaceholder(): Placeholder | null
    {
        let rankMatch: RegExpExecArray | null;
        let start: number;
        for (;;)
        {
            rankMatch = rankRegExp.exec(titlePattern);
            if (!rankMatch)
                return null;
            start = rankMatch.index;
            const prevChar = titlePattern[start - 1];
            if (prevChar !== '\\')
                break;
            rankRegExp.lastIndex = start + 1;
        }
        const [, rank] = rankMatch;
        const paramIndex = rank ? rank as any - 1 : 0;
        const keys: string[] = [];
        let index = rankRegExp.lastIndex;
        let propNameMatch: RegExpExecArray | null;
        while (propNameMatch = propNameRegExp.exec(titlePattern.slice(index)))
        {
            let escapedPropName;
            const propName =
            propNameMatch[1] ||
            propNameMatch[2] ||
            (
                (escapedPropName = propNameMatch[3] as string | undefined) != null ?
                escapedPropName : propNameMatch[4]
            )
            .replace(/\\([^])/g, '$1');
            keys.push(propName);
            index += propNameMatch[0].length;
        }
        rankRegExp.lastIndex = index;
        const placeholder = makePlaceholder(keys, start, index, paramIndex);
        validatePlaceholder(placeholder, !rank);
        return placeholder;
    }

    function getRawPlaceholder({ start, end }: Placeholder): string
    {
        const rawPlaceholder = titlePattern.substring(start, end);
        return rawPlaceholder;
    }

    function pushStaticChunk(start: number): void
    {
        if (end < start)
        {
            const chunk = titlePattern.substring(end, start).replace(/\\#/g, '#');
            chunks.push(chunk);
        }
    }

    function validatePlaceholder(placeholder: Placeholder, rankless: boolean): void
    {
        if (rankless)
        {
            if (paramCount > 1)
            {
                const rawPlaceholder = getRawPlaceholder(placeholder);
                let rankSpecification: string;
                switch (paramCount)
                {
                case 2:
                    rankSpecification = '#1 or #2';
                    break;
                case 3:
                    rankSpecification = '#1, #2 or #3';
                    break;
                default:
                    rankSpecification = `#1, #2, … #${paramCount}`;
                    break;
                }
                const message =
                `The placeholder ${rawPlaceholder} is ambiguous because there are ${paramCount} ` +
                `parameters. Use ${rankSpecification} instead of # to refer to a specific ` +
                'parameter.';
                throw Error(message);
            }
        }
        else
        {
            if (placeholder.paramIndex >= paramCount)
            {
                const rawPlaceholder = getRawPlaceholder(placeholder);
                const predicate =
                paramCount === 1 ? 'is only one parameter' : `are only ${paramCount} parameters`;
                const message =
                `The placeholder ${rawPlaceholder} is invalid because there ${predicate}.`;
                throw Error(message);
            }
        }
    }

    const rankRegExp = /#([1-9]\d*)?(?![$\w\u0080-\uffff])/g;
    const chunks: Chunk[] = [];
    let end = 0;
    {
        let placeholder: Placeholder | null;
        while (placeholder = findNextPlaceholder())
        {
            const { start } = placeholder;
            pushStaticChunk(start);
            chunks.push(placeholder);
            ({ end } = placeholder);
        }
    }
    pushStaticChunk(titlePattern.length);
    return chunks;
}

function makePlaceholder
(keys: string[], start: number, end: number, paramIndex: number): Placeholder
{
    const placeholder =
    keys as string[] & { start: number; end: number; paramIndex: number; };
    placeholder.start = start;
    placeholder.end = end;
    placeholder.paramIndex = paramIndex;
    return placeholder;
}

const propNameRegExp =
/^\.((?!\d)[$\w\u0080-\uffff]+)|^\[(?:(0|-?[1-9]\d*)|"((?:[^\\"]|\\[^])*)"|'((?:[^\\']|\\[^])*)')]/;

export default TitleFormatter;
