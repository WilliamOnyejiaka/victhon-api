import Service from "./Service";
import {Wallet as Entity} from "./../entities/Wallet";
import {AppDataSource} from "../data-source";
import {Transaction} from "../entities/Transaction";
import {Professional} from "../entities/Professional";


export default class Wallet extends Service {

    private readonly repo = AppDataSource.getRepository(Entity);
    private readonly transactionRepo = AppDataSource.getRepository(Transaction);

    public async wallet(userId: string) {
        try {
            const result = await this.repo.findOne({where: {professionalId: userId}});
            return this.responseData(200, false, "Wallet was retrieved successfully", result);
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async history(proId: string, page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;

            const professional = await AppDataSource.getRepository(Professional).findOne({
                where: {id: proId},
                relations: ['wallet']
            });

            if (!professional) return this.responseData(404, false, "Professional not found");

            if (!professional.wallet) return this.responseData(404, false, "Professional wallet not found");

            const [transactions, total] = await this.transactionRepo.findAndCount({
                where: {walletId: professional.wallet.id},
                skip,
                take: limit,
                order: {createdAt: "DESC"}, // sort newest first
            });

            const data = {
                records: transactions,
                pagination: this.pagination(page, limit, total),
            }

            return this.responseData(200, false, "Transactions have been retrieved successfully", data)
        } catch (error) {
            return this.handleTypeormError(error);
        }

    }
}