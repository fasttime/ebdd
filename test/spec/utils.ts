export function isArrayBased(array: unknown[]): boolean
{
    if (!(array instanceof Array))
        return false;
    const { length } = array;
    array.push(null);
    if (array.length !== length + 1)
        return false;
    array.pop();
    if (array.length !== length)
        return false;
    return true;
}
