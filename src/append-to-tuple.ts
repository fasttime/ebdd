type AppendHelper
<TupleType extends unknown[], ElementType, ExtendedTupleType = [unknown, ...TupleType]> =
AsArray<
{
    [KeyType in keyof ExtendedTupleType]:
    KeyType extends keyof TupleType ? TupleType[KeyType] : ElementType;
}
>;

type AppendToTuple<TupleType extends unknown[], ElementType> =
AppendHelper<TupleType, ElementType>;

type AsArray<TupleType> = TupleType extends unknown[] ? TupleType : never;

export default AppendToTuple;
