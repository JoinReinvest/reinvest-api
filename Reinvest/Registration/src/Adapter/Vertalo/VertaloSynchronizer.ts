import {VertaloAdapter} from "Registration/Adapter/Vertalo/VertaloAdapter";
import {
    VertaloSynchronizationRepository
} from "Registration/Adapter/Database/Repository/VertaloSynchronizationRepository";

export class VertaloSynchronizer {
    static getClassName = () => 'VertaloSynchronizer';
    private vertaloAdapter: VertaloAdapter;
    private vertaloSynchronizationRepository: VertaloSynchronizationRepository;

    constructor(vertaloAdapter: VertaloAdapter, vertaloSynchronizationRepository: VertaloSynchronizationRepository) {
        this.vertaloAdapter = vertaloAdapter;
        this.vertaloSynchronizationRepository = vertaloSynchronizationRepository;
    }
}
