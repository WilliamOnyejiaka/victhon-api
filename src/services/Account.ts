import { AppDataSource } from "../data-source";
import Service from "./Service";
import { Account as AccountEntity } from "../entities/Account";
import { Professional } from "../entities/Professional";


export default class Account extends Service {

    private readonly repo = AppDataSource.getRepository(AccountEntity);

    public async createAccount(professionalId: string, name: string, accountNumber: string, bankName: string) {
        try {
            const professionalRepo = AppDataSource.getRepository(Professional);
            const professional = await professionalRepo.findOneBy({ id: professionalId });

            if (!professional) return this.responseData(404, true, "User was not found");

            const account = this.repo.create({
                professional,
                name,
                bankName,
                accountNumber
            });

            return this.responseData(201, false, "Account was added successfully", account);
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }
}