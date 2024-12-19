import db from '../../models/index.js';
import { JOBS_PAGE_SIZE, SEARCH_JOBS_LIMIT } from '../../config/pagination.config.js';
import { getPagination } from '../../helpers/pagination.helper.js';
const Op = db.Sequelize.Op;
const fn = db.Sequelize.fn;
const col = db.Sequelize.col;

class JobController {
    async getJobs(req, res) {
        try {
            const { size } = req.query;
            const page = req.query.page - 1;
            const { limit, offset } = getPagination(page, JOBS_PAGE_SIZE);

            const job = await db.jobModel.findAll({
                limit, 
                offset
            });

            return res.status(200).json(job);
        } catch (err) {
            console.log(err);
            return res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }

    async createJob(req, res) {
        try {
            const { name } = req.body;
            const candidate = await db.jobModel.findOne({ 
                where: { name: name } 
            });
            if (candidate) {
                return res.status(400).json({ message: "Данная форма обучения уже существует" })
            }

            const job = await db.jobModel.create({
                name: name
            });
            return res.status(201).json(job);
        } catch (err) {
            console.log(err);
            res.status(422).json({ message: "Ошибка отправки данных", err });
        }
    }

    async getJobById(req, res) {
        try {
            const job = await db.jobModel.findByPk(req.params["id"]);
            return res.status(200).json(job);
        } catch (err) {
            console.log(err);
            res.status(422).json({ message: "Ошибка получения данных", err });
        }
    }

    async updateJobById(req, res) {
        try {
            const { 
                name: name
            } = req.body;
            await db.jobModel.update({ 
                name: name
            },{
                where: {
                    id: req.params["id"]
                }
            });
            const job = await db.jobModel.findByPk(req.params["id"]);
            return res.status(200).json(job);
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }

    async deleteJobById(req, res) {
        try {
            await db.jobModel.destroy({
                where: {
                    id: req.params["id"]
                }
            });
            return res.status(204).json();
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }

    async searchJob(req, res) {
        try {
            const { name: name } = req.query;
            const { page, size } = req.query;
            const { limit, offset } = getPagination(page, SEARCH_JOBS_LIMIT);

            const job = await db.jobModel.findAndCountAll({
                limit, 
                offset,
                where: {
                    name: { [Op.like]: '%' + name + '%' }
                }
            });     

            return res.status(200).json(job);
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }
}

export default new JobController;