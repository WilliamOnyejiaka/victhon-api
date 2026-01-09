import {AppDataSource} from "../data-source";
import {Professional} from "../entities/Professional";
import {CdnFolders, HttpStatus, ResourceType} from "../types/constants";
import Service from "./Service";
import {ServiceEntity} from "../entities/ServiceEntity";
import {DeepPartial} from "typeorm";
import Cloudinary from "./Cloudinary";
import {FailedFiles, UploadedFiles} from "../types";

interface ServiceSearchOptions {
    name?: string | undefined;
    category?: string | undefined;
    description?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    remote?: boolean | undefined;
    onsite?: boolean | undefined;
    store?: boolean | undefined;
    professionalId?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
}

export default class ProfessionalService extends Service {

    private readonly repo = AppDataSource.getRepository(ServiceEntity);
    private readonly professionalRepo = AppDataSource.getRepository(Professional);


    public async add(payload: any) {
        try {

            let professional = await this.professionalRepo.findOne({where: {id: payload.userId}});
            if (!professional) return this.responseData(HttpStatus.NOT_FOUND, true, `Professional was not found.`);

            let images: { url: string, publicId: string }[] = [];

            if (payload.files) {
                const cloudinary = new Cloudinary();

                let uploadedFiles: UploadedFiles[] = [], publicIds: string[] = [], failedFiles: FailedFiles[] = [];
                ({
                    uploadedFiles,
                    failedFiles,
                    publicIds
                } = await cloudinary.uploadV2(payload.files, ResourceType.IMAGE, CdnFolders.SERVICES));
                if (failedFiles?.length > 0) return this.responseData(500, true, "File uploads failed", failedFiles);

                images = uploadedFiles.map((upload) => ({url: upload.url, publicId: upload.publicId}));
            }


            const newService = this.repo.create({
                name: payload.name,
                professionalId: payload.userId,
                description: payload.description,
                category: payload.category,
                price: payload.price,
                hourlyPrice: payload.hourlyPrice ?? 0,
                address: payload.address,
                images: images,
                remoteLocationService: payload.remoteLocationService ?? false,
                onsiteLocationService: payload.onsiteLocationService ?? false,
                storeLocationService: payload.storeLocationService ?? false
            });

            const data = await this.repo.save(newService);
            return this.responseData(201, false, "Service has been created successfully", data)
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async service(
        userId: string,
        id: string
    ) {
        try {
            const professionalRepo = AppDataSource.getRepository(Professional);

            let user = await professionalRepo.findOne({where: {id: userId}});
            if (!user) return this.responseData(HttpStatus.NOT_FOUND, true, `Professional was not found.`);

            const result = await this.repo.findOne({where: {id, professionalId: userId}});
            if (!result) return this.responseData(HttpStatus.NOT_FOUND, true, "Service not found.");

            return this.responseData(HttpStatus.OK, false, `Service was retrieved successfully.`, result);
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async professionalServices(professionalId: string, page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;

            const [records, total] = await this.repo.findAndCount({
                where: {professionalId: professionalId},
                skip,
                take: limit,
                order: {updatedAt: "DESC"},
            });

            const data = {
                records: records,
                pagination: this.pagination(page, limit, total),
            }

            return this.responseData(200, false, "Services have been retrieved successfully", data)
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async allServices(page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;

            const [records, total] = await this.repo.findAndCount({
                skip,
                take: limit,
                order: {updatedAt: "DESC"},
            });

            const data = {
                records: records,
                pagination: this.pagination(page, limit, total),
            }

            return this.responseData(200, false, "Services have been retrieved successfully", data)
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async nearByProfessionals(longitude: number, latitude: number, radiusKm: number = 10, page: number = 1, limit: number = 10) {
        try {
            // Safety guards
            const safePage = Math.max(page, 1);
            const safeLimit = Math.min(Math.max(limit, 1), 50);
            const offset = (safePage - 1) * safeLimit;

            const radiusInMeters = radiusKm * 1000;

            /* -----------------------------
               Bounding box calculation - less expensive than the actual distance
            ------------------------------*/
            const earthRadius = 6371000; // meters

            const latDelta = (radiusInMeters / earthRadius) * (180 / Math.PI);
            const lngDelta =
                latDelta / Math.cos((latitude * Math.PI) / 180);

            const minLat = latitude - latDelta;
            const maxLat = latitude + latDelta;
            const minLng = longitude - lngDelta;
            const maxLng = longitude + lngDelta;

            const repo = AppDataSource.getRepository(Professional);

            const qb = repo
                .createQueryBuilder("professional")
                .addSelect(
                    `
                          ST_Distance_Sphere(
                            professional.location,
                            ST_GeomFromText('POINT(${longitude} ${latitude})', 4326)
                          )
                          `,
                    "distance"
                )
                // 1️⃣ Spatial index filter (FAST)
                .where(
                    `
                              MBRContains(
                                ST_GeomFromText(
                                  'POLYGON((
                                    ${minLng} ${minLat},
                                    ${maxLng} ${minLat},
                                    ${maxLng} ${maxLat},
                                    ${minLng} ${maxLat},
                                    ${minLng} ${minLat}
                                  ))',
                                  4326
                                ),
                                professional.location
                              )
                              `
                )
                // 2️⃣ Accurate distance filter
                .andWhere(
                    `
                              ST_Distance_Sphere(
                                professional.location,
                                ST_GeomFromText('POINT(${longitude} ${latitude})', 4326)
                              ) <= :radius
                              `
                )
                .andWhere("professional.isActive = true")
                .andWhere("professional.availability = true")
                .setParameter("radius", radiusInMeters)
                .orderBy("distance", "ASC")
                .skip(offset)
                .take(safeLimit);

            /* -----------------------------
               Execute queries
            ------------------------------*/
            const [result, total] = await Promise.all([
                qb.getRawAndEntities(),
                qb.clone().skip(undefined).take(undefined).getCount(),
            ]);

            /* -----------------------------
               Attach distance to entities
            ------------------------------*/
            const professionals = result.entities.map((pro, index) => ({
                ...pro,
                distance: Number(result.raw[index].distance), // meters
            }));

            const data = {
                records: professionals,
                pagination: this.pagination(page, limit, total),
            }
            return this.responseData(200, false, "Professionals have been retrieved successfully", data);
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }


    public async searchServices(
        options: ServiceSearchOptions
    ) {
        try {
            const {
                name,
                category,
                description,
                minPrice,
                maxPrice,
                remote,
                onsite,
                store,
                professionalId,
                limit = 10,
                page = 1
            } = options

            const query = this.repo.createQueryBuilder("service");

            // Dynamic filters: only add them if present
            if (name) {
                query.orWhere("service.name LIKE :name", {name: `%${name}%`});
            }

            if (category) {
                query.orWhere("service.category LIKE :category", {category: `%${category}%`});
            }

            if (description) {
                query.orWhere("service.description LIKE :description", {description: `%${description}%`});
            }

            // Price range filter
            if (minPrice !== undefined) {
                query.andWhere("service.price >= :minPrice", {minPrice});
            }
            if (maxPrice !== undefined) {
                query.andWhere("service.price <= :maxPrice", {maxPrice});
            }

            // Service type filters
            if (remote !== undefined) query.andWhere("service.remoteLocationService = :remote", {remote});
            if (onsite !== undefined) query.andWhere("service.onsiteLocationService = :onsite", {onsite});
            if (store !== undefined) query.andWhere("service.storeLocationService = :store", {store});

            // Filter by professional
            if (professionalId) query.andWhere("service.professionalId = :professionalId", {professionalId});

            // Pagination
            const offset = (page - 1) * limit;
            query.skip(offset).take(limit);

            // Sorting by latest updated
            query.orderBy("service.updatedAt", "DESC");

            const [services, total] = await query.getManyAndCount();

            const data = {
                records: services,
                pagination: this.pagination(page, limit, total),
            }
            return this.responseData(200, false, "Services have been retrieved successfully", data)
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    private async massImageDelete(publicIds: string[]) {
        const results: { publicId: string, success: boolean }[] = [];

        await Promise.all(
            publicIds.map(async (publicId: string) => {
                const cloudinary = new Cloudinary();
                const result = await cloudinary.delete(publicId);
                if (result.statusCode == 500) {
                    results.push({
                        success: false,
                        publicId,
                    });
                } else {
                    results.push({
                        success: true,
                        publicId,
                    });
                }
            })
        );

        const success: string[] = results
            .filter((result) => result.success)
            .map((result) => result.publicId);
        const failed: string[] = results
            .filter((result) => !result.success)
            .map((result) => result.publicId);

        return {success, failed};
    }


    public async update(
        payload: any
    ) {
        try {
            const professionalRepo = AppDataSource.getRepository(Professional);

            let user = await professionalRepo.findOne({where: {id: payload.professionalId}});
            if (!user) return this.responseData(HttpStatus.NOT_FOUND, true, `Professional was not found.`);

            const existing = await this.repo.findOne({where: {id: payload.id, professionalId: payload.professionalId}});
            if (!existing) {
                return this.responseData(HttpStatus.NOT_FOUND, true, "Service not found.");
            }

            await this.repo.update({id: payload.id, professionalId: payload.professionalId}, {
                name: payload.name ?? existing.name,
                description: payload.description ?? existing.description,
                category: payload.category ?? existing.category,
                price: payload.price ?? existing.price,
                hourlyPrice: payload.hourlyPrice ?? existing.hourlyPrice,
                address: payload.address ?? existing.address,
                remoteLocationService: payload.remoteLocationService ?? existing.remoteLocationService,
                onsiteLocationService: payload.onsiteLocationService ?? existing.onsiteLocationService,
                storeLocationService: payload.storeLocationService ?? existing.storeLocationService
            });

            return this.responseData(HttpStatus.OK, false, `Service was updated successfully.`);
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

            let user = await professionalRepo.findOne({where: {id: userId}});
            if (!user) return this.responseData(HttpStatus.NOT_FOUND, true, `Professional was not found.`);

            const professionalService = await this.repo.findOne({where: {id: id, professionalId: userId}});

            if (!professionalService) return this.responseData(HttpStatus.NOT_FOUND, true, `Service was not found.`);

            const publicIds = professionalService.images?.map((image) => image.publicId) ?? [];

            if (publicIds.length > 0) await (new Cloudinary()).deleteFiles(publicIds);

            await this.repo.delete({professionalId: userId, id})
            return this.responseData(HttpStatus.OK, false, `Service was deleted successfully.`);

        } catch (error) {
            return this.handleTypeormError(error);
        }
    }
}