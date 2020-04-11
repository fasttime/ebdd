const ExtensibleArray =
function ()
{ } as unknown as { new <ElementType>(): ElementType[]; };
ExtensibleArray.prototype = Array.prototype;

export default ExtensibleArray;
