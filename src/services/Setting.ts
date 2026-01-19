import { AppDataSource } from "../data-source";
import Service from "./Service";
import { Setting as SettingEntity } from "../entities/SettingEntity";
import { Professional } from "../entities/Professional";
import { HttpStatus } from "../types/constants";

export default class SettingService extends Service {

    private readonly repo = AppDataSource.getRepository(SettingEntity);
    private readonly professionalRepo = AppDataSource.getRepository(Professional);

    public async create(
        professionalId: string
    ) {
        try {
            const professional = await this.professionalRepo.findOne({
                where: { id: professionalId },
            });

            if (!professional) {
                return this.responseData(
                    HttpStatus.NOT_FOUND,
                    true,
                    "Professional was not found"
                );
            }

            const existing = await this.repo.findOne({
                where: { professionalId },
            });

            if (existing) {
                return this.responseData(
                    HttpStatus.BAD_REQUEST,
                    true,
                    "Settings already exist for this professional"
                );
            }

            const setting = this.repo.create({
                professionalId
            });

            const saved = await this.repo.save(setting);

            return this.responseData(
                HttpStatus.CREATED,
                false,
                "Settings were created successfully",
                saved
            );
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async get(
        professionalId: string
    ) {
        try {
            const setting = await this.repo.findOne({
                where: { professionalId },
            });

            if (!setting) {
                return this.responseData(
                    HttpStatus.NOT_FOUND,
                    true,
                    "Settings not found"
                );
            }

            return this.responseData(
                HttpStatus.OK,
                false,
                "Settings retrieved successfully",
                setting
            );
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async update(
        professionalId: string,
        payload: Partial<{
            bookingRequestsEnabled: boolean;
            newMessagesEnabled: boolean;
            paymentReceivedEnabled: boolean;
            customerReviewsEnabled: boolean;
        }>
    ) {
        try {
            const setting = await this.repo.findOne({
                where: { professionalId },
            });

            if (!setting) {
                return this.responseData(
                    HttpStatus.NOT_FOUND,
                    true,
                    "Settings not found"
                );
            }

            Object.assign(setting, payload);

            const updated = await this.repo.save(setting);

            return this.responseData(
                HttpStatus.OK,
                false,
                "Settings updated successfully",
                updated
            );
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async delete(
        professionalId: string
    ) {
        try {
            const setting = await this.repo.findOne({
                where: { professionalId },
            });

            if (!setting) {
                return this.responseData(
                    HttpStatus.NOT_FOUND,
                    true,
                    "Settings not found"
                );
            }

            await this.repo.remove(setting);

            return this.responseData(
                HttpStatus.OK,
                false,
                "Settings deleted successfully"
            );
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }
}
