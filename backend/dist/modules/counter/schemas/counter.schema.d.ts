import { Document } from 'mongoose';
export type CounterDocument = Counter & Document;
export declare class Counter {
    key: string;
    seq: number;
}
export declare const CounterSchema: import("mongoose").Schema<Counter, import("mongoose").Model<Counter, any, any, any, Document<unknown, any, Counter, any, {}> & Counter & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Counter, Document<unknown, {}, import("mongoose").FlatRecord<Counter>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Counter> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
