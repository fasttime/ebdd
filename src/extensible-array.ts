const ExtensibleArray =
function (): void
{ } as unknown as { new <ElementType>(): ElementType[]; };
ExtensibleArray.prototype = Array.prototype;

export default ExtensibleArray;
