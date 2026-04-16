export interface TransactionCompletedEvent {
  id: string;
  senderAccountId: string;
  receiverAccountId: string;
  amount: number;
  currency: string;
  occurredAt: Date;
}
export interface DepositRequestedEvent {
  eventId: string,
  accountId: string,
  amount: number;
}
export interface FailedRequestedEvent {
  eventId: string,
  accountId: string,
  amount: number;
}