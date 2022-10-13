import {TransactionRepositoryInterface} from "../ProcessManager/Transaction/TransactionRepositoryInterface";
import {InitializeTransactionCommand} from "./InitializeTransactionCommand";
import {TransactionCreated} from "../../Model/DomainEvents/TransactionCreated";
import {Result} from "../Commons/Result";
import {TransactionException} from "../ProcessManager/Transaction/TransactionException";

export class InitializeTransaction {
    private transactionRepository: TransactionRepositoryInterface;

    constructor(transactionRepository: TransactionRepositoryInterface) {
        this.transactionRepository = transactionRepository;
    }

    public async execute(command: InitializeTransactionCommand) {
        const transactionCreated = new TransactionCreated(
            command.portfolioId,
            command.investorAccountId,
            command.amountToInvest
        );

        try {
            await this.transactionRepository.publish(transactionCreated);
        } catch (exception: TransactionException | unknown) {
            // TODO handle it
            return Result.Failure;
        }

        return Result.Success
    }
}