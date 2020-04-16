type AppendHelper
<TupleType extends unknown[], ElementType, ExtendedTupleType = OneMore<TupleType>> =
AsArray<
{
    [KeyType in keyof ExtendedTupleType]:
    KeyType extends keyof TupleType ? TupleType[KeyType] : ElementType;
}
>;

type AppendToTuple<TupleType extends unknown[], ElementType> =
AppendHelper<TupleType, ElementType>;

type AsArray<TupleType> = TupleType extends unknown[] ? TupleType : never;

type OneMore<TupleType extends unknown[]> =
((arg0: unknown, ...args: TupleType) => unknown) extends
(...args: infer ElementType) => unknown ?
ElementType : never;

export default AppendToTuple;
