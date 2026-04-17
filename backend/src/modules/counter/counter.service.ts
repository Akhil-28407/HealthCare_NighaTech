import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Counter, CounterDocument } from './schemas/counter.schema';

@Injectable()
export class CounterService {
  constructor(
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
  ) {}

  async getNextSequence(key: string): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { key },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    return counter.seq;
  }

  async generateNumber(prefix: string, entity: string, vendorId?: string): Promise<string> {
    const year = new Date().getFullYear();
    const key = `${entity}-${year}`;
    const seq = await this.getNextSequence(key);
    return `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
  }
}
