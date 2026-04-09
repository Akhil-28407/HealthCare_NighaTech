import { Model } from 'mongoose';
import { CounterDocument } from './schemas/counter.schema';
export declare class CounterService {
    private counterModel;
    constructor(counterModel: Model<CounterDocument>);
    getNextSequence(key: string): Promise<number>;
    generateNumber(prefix: string, entity: string): Promise<string>;
}
