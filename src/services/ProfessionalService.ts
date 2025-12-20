import { AppDataSource } from "../data-source";
import { Professional } from "../entities/Professional";
import { HttpStatus } from "../types/constants";
import Service from "./Service";
import { ServiceEntity } from "../entities/ServiceEntity";
import { DeepPartial } from "typeorm";

export default class ProfessionalService extends Service {

    private readonly repo = AppDataSource.getRepository(ServiceEntity);

    public async add(payload: any) {
        try {
            const userRepo = AppDataSource.getRepository(Professional);

            let user = await userRepo.findOne({ where: { id: payload.userId } });
            if (!user) return this.responseData(HttpStatus.NOT_FOUND, true, `Professional was not found.`);

            const serviceRepo = AppDataSource.getRepository(ServiceEntity);

            const newService = serviceRepo.create({
                name: payload.name,
                professionalId: payload.userId,
                description: payload.description,
                category: payload.category,
                price: payload.price,
                hourlyPrice: payload.hourlyPrice ?? 0,
                address: payload.address,
                remoteLocationService: payload.remoteLocationService ?? false,
                onsiteLocationService: payload.onsiteLocationService ?? false,
                storeLocationService: payload.storeLocationService ?? false
            });

            const data = await serviceRepo.save(newService);
            return this.responseData(201, false, "Package has been created", data)
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async package(
        userId: string,
        id: string
    ) {
        try {
            const professionalRepo = AppDataSource.getRepository(Professional);

            let user = await professionalRepo.findOne({ where: { id: userId } });
            if (!user) return this.responseData(HttpStatus.NOT_FOUND, true, `Professional was not found.`);

            const result = await this.repo.findOne({ where: { id, professionalId: userId } });
            if (!result) {
                return this.responseData(HttpStatus.NOT_FOUND, true, "Package not found.");
            }

            return this.responseData(HttpStatus.OK, false, `Package was retrieved successfully.`, result);
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async packages(professionalId: string, page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;

            const [records, total] = await this.repo.findAndCount({
                where: { professionalId: professionalId },
                skip,
                take: limit,
                order: { updatedAt: "DESC" },
            });

            const data = {
                records: records,
                pagination: this.pagination(page, limit, total),
            }

            return this.responseData(200, false, "Packages have been retrieved successfully", data)
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async update(
        id: string,
        name: string,
        professionalId: string,
        description: string,
        price: number,
        type: string,
        addOns: any
    ) {
        try {
            const professionalRepo = AppDataSource.getRepository(Professional);

            let user = await professionalRepo.findOne({ where: { id: professionalId } });
            if (!user) return this.responseData(HttpStatus.NOT_FOUND, true, `Professional was not found.`);

            const existing = await this.repo.findOne({ where: { id, professionalId: professionalId } });
            if (!existing) {
                return this.responseData(HttpStatus.NOT_FOUND, true, "Package not found.");
            }

            // await this.repo.update({ id, professionalId: professionalId }, {
            //     name: name ?? existing.name,
            //     description: description ?? existing.description,
            //     type: type ?? existing.type,
            //     addOns: addOns ?? existing.addOns,
            //     price: price ?? existing.price,
            // } as DeepPartial<PackageEntity>);

            return this.responseData(HttpStatus.OK, false, `Package was updated successfully.`);
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async delete(
        userId: string,
        id: string
    ) {
        try {
            const professionalRepo = AppDataSource.getRepository(Professional);

            let user = await professionalRepo.findOne({ where: { id: userId } });
            if (!user) return this.responseData(HttpStatus.NOT_FOUND, true, `Professional was not found.`);

            await this.repo.delete({ professionalId: userId, id })
            return this.responseData(HttpStatus.OK, false, `Package was deleted successfully.`);

        } catch (error) {
            return this.handleTypeormError(error);
        }
    }
}