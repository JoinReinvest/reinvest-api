import {TransactionRepositoryInterface} from "../../Domain/Transaction/TransactionRepositoryInterface";
import {TransactionException} from "../../Domain/Transaction/TransactionException";
import {TransactionCreated} from "../../Domain/Transaction/Events/TransactionCreated";
import {InitializeTransactionCommand} from "./InitializeTransactionCommand";
import {Result} from "../../Domain/Commons/Result";


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