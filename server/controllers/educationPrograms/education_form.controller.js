import db from '../../models/index.js';
import { EDUCATION_PROGRAMS_PAGE_SIZE } from '../../config/pagination.config.js';
import { getPagination } from '../../helpers/pagination.helper.js';
const Op = db.Sequelize.Op;

class EduFormController {
    async getForms(req, res) {
        try {
            const { size } = req.query;
            const page = req.query.page - 1;
            const { limit, offset } = getPagination(page, EDUCATION_PROGRAMS_PAGE_SIZE);

            const forms = await db.eduFormModel.findAll({ limit, offset });

            return res.status(200).json(forms);
        } catch (err) {
            console.log(err);
            return res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }

    async createForm(req, res) {
        try {
            const { name } = req.body;
            const candidate = await db.eduFormModel.findOne({ where: { name: name } });
            if (candidate) {
                return res.status(400).json({ message: "Данная форма обучения уже существует" })
            }

            const form = await db.eduFormModel.create({
                name: name
            });
            return res.status(201).json(form);
        } catch (err) {
            console.log(err);
            res.status(422).json({ message: "Ошибка отправки данных", err });
        }
    }

    async getFormById(req, res) {
        try {
            const form = await db.eduFormModel.findByPk(req.params["id"]);
            return res.status(200).json(form);
        } catch (err) {
            console.log(err);
            res.status(422).json({ message: "Ошибка получения данных", err });
        }
    }

    async updateFormById(req, res) {
        try {
            const { name } = req.body;
            await db.eduFormModel.update({ 
                name: name
            },{
                where: {
                    id: req.params["id"]
                }
            });
            const form = await db.eduFormModel.findByPk(req.params["id"]);
            return res.status(200).json(form);
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }

    async deleteFormById(req, res) {
        try {
            await db.eduFormModel.destroy({
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

    async searchForm(req, res) {
        try {
            const { name } = req.query;
            const { size } = req.query;
            const page = req.query.page - 1;
            const { limit, offset } = getPagination(page, EDUCATION_PROGRAMS_PAGE_SIZE);

            const forms = await db.eduFormModel.findAll({
                limit, 
                offset,
                where: {
                    name: {
                        [Op.like]: '%' + name + '%'
                    }
                }
                // limit: 10
            });     

            return res.status(200).json(forms);
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }

    async searchProgramByForm(req, res) {
        try {
            const { size } = req.query;
            const page = req.query.page - 1;
            const { limit, offset } = getPagination(page, EDUCATION_PROGRAMS_PAGE_SIZE);

            const programs = await db.eduProgramModel.findAll({
                limit, 
                offset,
                include: {
                    where: {
                        id: req.params["id"]
                    },
                    model: db.eduFormModel
                },
                attributes: {exclude: ['education_form_id']},
            })
            return res.status(200).json(programs);
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }
}

export default new EduFormController;