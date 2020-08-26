import AppendToTuple from './append-to-tuple';

export function bindArguments
<ThisType, ArgListType extends unknown[], RetType>
(fn: (this: ThisType, ...args: ArgListType) => RetType, args: ArgListType):
(this: ThisType) => RetType
{
    const boundFn =
    function (this: ThisType): RetType
    {
        const returnValue = fn.apply(this, args);
        return returnValue;
    };
    return boundFn;
}

export function bindArgumentsButLast
<ThisType, ArgListType extends unknown[], LastArgType, RetType>
(
    fn:     (this: ThisType, ...args: AppendToTuple<ArgListType, LastArgType>) => RetType,
    args:   ArgListType,
):
(this: ThisType, lastArg: LastArgType) => RetType
{
    const boundFn =
    function (this: ThisType, lastArg: LastArgType): RetType
    {
        const argsAndLast = args.concat([lastArg]) as AppendToTuple<ArgListType, LastArgType>;
        const returnValue = fn.apply(this, argsAndLast);
        return returnValue;
    };
    return boundFn;
}
