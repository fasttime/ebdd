import type { ReporterConstructor } from 'mocha';

declare global
{
    const MochaBar: ReporterConstructor;
}
