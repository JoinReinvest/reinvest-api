import {TransactionRepositoryInterface} from "../../Domain/Transaction/TransactionRepositoryInterface";
import {TransactionException} from "../../Domain/Transaction/TransactionException";
import {TransactionCreated} from "../../Domain/Transaction/Events/TransactionCreated";
import {InitializeTransactionCommand} from "./InitializeTransactionCommand";
import {Result} from "../../Domain/Commons/Result";
import {UniqueIdGenerator} from "../Tools/UniqueIdGenerator";
import {TransactionId} from "../../Domain/Transaction/ValueObject/TransactionId";


export class InitializeTransaction {
    private transactionRepository: TransactionRepositoryInterface;
    private idGenerator: UniqueIdGenerator;

    constructor(transactionRepository: TransactionRepositoryInterface, idGenerator: UniqueIdGenerator) {
        this.transactionRepository = transactionRepository;
        this.idGenerator = idGenerator;
    }

    public async execute(command: InitializeTransactionCommand) {
        const transactionCreated = new TransactionCreated(
            TransactionId.fromUniqueId(this.idGenerator.create()),
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