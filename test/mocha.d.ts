declare const MochaBar: ReporterConstructor;
declare namespace Mocha
{
    interface MochaOptions
    {
        checkLeaks: boolean;
    }
}
