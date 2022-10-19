import {TransactionRepositoryInterface} from "../../Domain/TransactionRepositoryInterface";
import {TransactionException} from "../../Domain/TransactionException";
import {TransactionCreated} from "../../Domain/Events/TransactionCreated";
import {InitializeTransactionCommand} from "./InitializeTransactionCommand";
import {Result} from "../../../Commons/Result";
import {UniqueIdGenerator} from "../Tools/UniqueIdGenerator";
import {TransactionId} from "../../Domain/ValueObject/TransactionId";


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