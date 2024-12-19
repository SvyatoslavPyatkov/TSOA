import db from '../../models/index.js';
import { LEARNERS_PAGE_SIZE, SEARCH_LEARNERS_LIMIT } from '../../config/pagination.config.js';
import { getPagination } from '../../helpers/pagination.helper.js';
const Op = db.Sequelize.Op;
const fn = db.Sequelize.fn;
const col = db.Sequelize.col;

class LearnerController {
    async getLearners(req, res) {
        try {
            const { size } = req.query;
            const page = req.query.page - 1;
            const { limit, offset } = getPagination(page, LEARNERS_PAGE_SIZE);

            const learners = await db.learnerModel.findAll({
                limit, 
                offset,
                include: [{
                    model: db.passportModel
                }, {
                    model: db.jobModel
                }, {
                    model: db.groupModel,
                    include: {
                        model: db.eduProgramModel,
                        include: {
                            model: db.eduFormModel
                        },
                        attributes: {exclude: ['education_form_id']}
                    }
                }],
                attributes: {exclude: ['passport_id', 'job_id', 'group_id']}
            });

            return res.status(200).json(learners);
        } catch (err) {
            console.log(err);
            return res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }

    async createLearner(req, res) {
        try {
            const { 
                phone_number,
                email,
                address,
                SNILS,
                INN,
                passport_id,
                job_id,
                group_id
            } = req.body;
            const candidate = await db.learnerModel.findOne({ 
                where: { 
                    phone_number: phone_number,
                    email: email,
                    address: address,
                    SNILS: SNILS,
                    INN: INN,
                    passport_id: passport_id,
                    job_id: job_id,
                    group_id: group_id
                } 
            });
            if (candidate) {
                return res.status(400).json({ message: "Данная запись слушателя уже существует" })
            }

            const learner = await db.learnerModel.create({
                phone_number: phone_number,
                email: email,
                address: address,
                SNILS: SNILS,
                INN: INN,
                passport_id: passport_id,
                job_id: job_id,
                group_id: group_id
            });
            return res.status(201).json(learner);
        } catch (err) {
            console.log(err);
            res.status(422).json({ message: "Ошибка отправки данных", err });
        }
    }

    async getLearnerById(req, res) {
        try {
            const learner = await db.learnerModel.findByPk(req.params["id"], {
                include: [{
                    model: db.passportModel
                }, {
                    model: db.jobModel
                }, {
                    model: db.groupModel
                }],
                attributes: {exclude: ['passport_id', 'job_id', 'group_id']}
            });
            return res.status(200).json(learner);
        } catch (err) {
            console.log(err);
            res.status(422).json({ message: "Ошибка получения данных", err });
        }
    }

    async updateLearnerById(req, res) {
        try {
            const { 
                phone_number: phone_number,
                email: email,
                address: address,
                SNILS: SNILS,
                INN: INN,
                passport_id: passport_id,
                job_id: job_id,
                group_id: group_id
            } = req.body;
            await db.learnerModel.update({ 
                phone_number: phone_number,
                email: email,
                address: address,
                SNILS: SNILS,
                INN: INN,
                passport_id: passport_id,
                job_id: job_id,
                group_id: group_id
            },{
                where: {
                    id: req.params["id"]
                }
            });
            const learner = await db.learnerModel.findByPk(req.params["id"]);
            return res.status(200).json(learner);
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }

    async deleteLearnerById(req, res) {
        try {
            await db.learnerModel.destroy({
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

    async searchLearner(req, res) {
        try {
            const { size } = req.query;
            const page = req.query.page - 1;
            const { limit, offset } = getPagination(page, SEARCH_LEARNERS_LIMIT);
            const { text: text } = req.query;

            const learners = await db.learnerModel.findAll({
                limit, 
                offset,
                include: {
                    model: db.passportModel,
                    where: {
                        FIO: where(
                            fn(
                              'concat',
                              col('first_name'),
                              ' ',
                              col('last_name'),
                              ' ',
                              col('patronymic')
                            ),
                            { [Op.like]: '%' + text + '%' }
                        )
                    }
                }
            });     

            return res.status(200).json(learners);
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }
}

export default new LearnerController;