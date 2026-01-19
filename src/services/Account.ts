import { AppDataSource } from "../data-source";
import Service from "./Service";
import { Account as AccountEntity } from "../entities/Account";
import { Professional } from "../entities/Professional";
import axios from "axios";
import env, { EnvKey } from "../config/env";


export default class Account extends Service {

    private readonly repo = AppDataSource.getRepository(AccountEntity);
    private readonly PAYSTACK_SECRET_KEY = env(EnvKey.PAYSTACK_SECRET_KEY)!;

    public async createAccount(professionalId: string, name: string, accountNumber: string, bankName: string, bankCode: string) {
        try {
            const professionalRepo = AppDataSource.getRepository(Professional);
            const professional = await professionalRepo.findOneBy({ id: professionalId });

            if (!professional) return this.responseData(404, true, "User was not found");

            const res = await axios.get(
                "https://api.paystack.co/bank/resolve",
                {
                    params: {
                        account_number: accountNumber,
                        bank_code: bankCode,
                    },
                    headers: {
                        Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
                    },
                    timeout: 30000, // ✅ now works
                }
            );

            // return this.responseData(201, false, "Account was added successfully", res.data.data);


            const account = this.repo.create({
                professional,
                name,
                bankName,
                accountNumber,
                bankCode
            });

            const savedAccount: any = (await this.repo.save(account));

            return this.responseData(201, false, "Account was added successfully", savedAccount);
        } catch (error) {
            console.log(error);
            if (axios.isAxiosError(error)) {
                return this.responseData(400, true, error.response?.data?.message);
            }
            return this.handleTypeormError(error);
        }
    }

    public async getAccounts(
        professionalId: string,
        page: number = 1,
        limit: number = 10
    ) {
        try {
            page = Math.max(1, page);
            limit = Math.min(50, Math.max(1, limit)); // hard cap

            const skip = (page - 1) * limit;

            const [accounts, total] = await this.repo.findAndCount({
                where: {
                    professional: { id: professionalId },
                },
                order: { createdAt: "DESC" },
                skip,
                take: limit,
            });

            const data = {
                records: accounts,
                pagination: this.pagination(page, limit, total),
            }


            return this.responseData(
                200,
                false,
                "Accounts retrieved successfully",
                data
            );
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }


    public async getAccount(accountId: string, professionalId: string) {
        try {
            const account = await this.repo.findOne({
                where: {
                    id: accountId,
                    professional: { id: professionalId },
                },
                relations: ["professional"],
            });

            if (!account) return this.responseData(404, true, "Account not found");

            return this.responseData(
                200,
                false,
                "Account retrieved successfully",
                account
            );
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async deleteAccount(accountId: string, professionalId: string) {
        try {
            const account = await this.repo.findOne({
                where: {
                    id: accountId,
                    professional: { id: professionalId },
                },
            });

            if (!account)
                return this.responseData(404, true, "Account not found");

            await this.repo.remove(account);

            return this.responseData(
                200,
                false,
                "Account deleted successfully"
            );
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async updateAccount(
        accountId: string,
        professionalId: string,
        payload: Partial<{
            name: string;
            accountNumber: string;
            bankName: string;
            bankCode: string;
        }>
    ) {
        try {
            const account = await this.repo.findOne({
                where: {
                    id: accountId,
                    professional: { id: professionalId },
                },
            });

            if (!account)
                return this.responseData(404, true, "Account not found");

            // If bank details are being changed, re-verify
            if (payload.accountNumber && payload.bankCode) {
                await axios.get(
                    "https://api.paystack.co/bank/resolve",
                    {
                        params: {
                            account_number: payload.accountNumber,
                            bank_code: payload.bankCode,
                        },
                        headers: {
                            Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
                        },
                        timeout: 30000,
                    }
                );
            }

            Object.assign(account, payload);
            const updated = await this.repo.save(account);

            return this.responseData(
                200,
                false,
                "Account updated successfully",
                updated
            );
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return this.responseData(
                    400,
                    true,
                    error.response?.data?.message || "Invalid bank details"
                );
            }
            return this.handleTypeormError(error);
        }
    }

    public async banks() {
        try {
            const res = await axios.get('https://api.paystack.co/bank?currency=NGN', { timeout: 30000 });
            const data = await res.data;
            return this.responseData(200, false, "Banks were retrieved successfully", data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') return this.responseData(500, true, "Paystack request timed out");
                return this.responseData(500, true, 'Failed to fetch banks');
            }

            return this.responseData(500, true, 'Something went wrong');
        }
    }
}