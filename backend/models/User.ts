import { prop, getModelForClass } from '@typegoose/typegoose';

export class User {
  @prop({ required: true, unique: true })
  public walletAddress!: string;

  @prop()
  public username?: string;

  @prop({ default: 0 })
  public totalCademEarned!: number;

  @prop({ default: 0 })
  public currentCademBalance!: number;

  @prop({ default: 1 })
  public level!: number;

  @prop({ default: 0 })
  public experiencePoints!: number;

  @prop({ default: () => new Date() })
  public createdAt!: Date;
}

export const UserModel = getModelForClass(User);