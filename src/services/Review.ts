import { AppDataSource } from "../data-source";
import Service from "./Service";
import { Review as Entity } from "../entities/Review";
import { Professional } from "../entities/Professional";
import { RatingAggregate } from "../entities/RatingAggregate";
import { Queues } from "../config/bullMQ";


export default class Review extends Service {

    private readonly repo = AppDataSource.getRepository(Entity);
    private readonly ratingAggRepo = AppDataSource.getRepository(RatingAggregate);

    public async create(userId: string, professionalId: string, rating: number, text: string) {
        try {
            const data = await AppDataSource.transaction(async (manager) => {
                const existingProfessional = await manager.findOne(Professional, {
                    where: { id: professionalId },
                });

                if (!existingProfessional) {
                    throw new Error('Professional was not found');
                }

                const review = manager.create(Entity, {
                    userId,
                    professionalId,
                    text,
                    rating
                });

                return await manager.save(review);
            });

            await Queues.updateRatingAgg.add('updateRatingAgg', { professionalId }, { jobId: `send-${Date.now()}`, priority: 1 });

            return this.responseData(201, false, "Review was created successfully", data);
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async reviews(professionalId: string, page: number, limit: number) {
        try {
            const skip = (page - 1) * limit;

            const [[reviews, total], details] = await Promise.all([
                this.repo.findAndCount({
                    where: { professionalId: professionalId },
                    skip,
                    take: limit,
                    order: { createdAt: "DESC" },
                    relations: ["user"],
                }),
                this.ratingAggRepo.findOne({ where: { professionalId: professionalId } })
            ]);

            const data = {
                records: reviews,
                pagination: this.pagination(page, limit, total),
                details
            }


            return this.responseData(200, false, "Reviews have been retrieved successfully", data)
        } catch (error) {
            return this.handleTypeormError(error);
        }
    }

    public async updateProfessionalRating(professionalId: string) {
        try {
            const result = await this.repo
                .createQueryBuilder("reviews")
                .select("reviews.rating", "rating")
                .addSelect("COUNT(*)", "total")
                .where("reviews.professionalId = :professionalId", { professionalId })
                .groupBy("reviews.rating")
                .getRawMany();

            const totalSum = result.reduce((sum, r) => sum + Number(r.rating) * Number(r.total), 0);
            const total = result.reduce((sum, r) => sum + Number(r.total), 0);
            const avg = total === 0 ? 0 : totalSum / total;

            const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            for (const r of result) distribution[r.rating] = Number(r.total);

            await this.ratingAggRepo.upsert(
                {
                    professionalId,
                    average: Number(avg.toFixed(2)),
                    total,
                    ratingDistribution: distribution as any,
                },
                ["professionalId"]
            );
        } catch (error) {
            this.handleTypeormError(error);
        }
    }

}