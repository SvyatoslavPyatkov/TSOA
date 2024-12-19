import db from '../../models/index.js';
import { PASSPORTS_PAGE_SIZE, SEARCH_PASSPORT_PAGINATE } from '../../config/pagination.config.js';
import { getPagination } from '../../helpers/pagination.helper.js';
const Op = db.Sequelize.Op;
const fn = db.Sequelize.fn;
const col = db.Sequelize.col;
const where = db.Sequelize.where;

class PassportController {
    async getPassports(req, res) {
        try {
            const { size } = req.query;
            const page = req.query.page - 1;
            const { limit, offset } = getPagination(page, PASSPORTS_PAGE_SIZE);

            const passports = await db.passportModel.findAndCountAll({
                raw: true,
                limit, 
                offset
            });
            // res.set('Access-Control-Allow-Origin', '*');
            return res.status(200).json(passports);
        } catch (err) {
            console.log(err);
            return res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }

    async createPassport(req, res) {
        try {
            const { 
                first_name,
                last_name,
                patronymic,
                series,
                number,
                issued_by,
                issued_date,
                birth_date,
                code,
                gender
            } = req.body;
            const candidate = await db.passportModel.findOne({ 
                where: {
                    first_name: first_name,
                    last_name: last_name,
                    patronymic: patronymic,
                    series: series,
                    number: number,
                    issued_by: issued_by,
                    issued_date: issued_date,
                    birth_date: birth_date,
                    code: code,
                    gender: gender
                } 
            });
            if (candidate) {
                return res.status(400).json({ message: "Данная запись паспорта уже существует" })
            }

            const passport = await db.passportModel.create({
                first_name: first_name,
                last_name: last_name,
                patronymic: patronymic,
                series: series,
                number: number,
                issued_by: issued_by,
                issued_date: issued_date,
                birth_date: birth_date,
                code: code,
                gender: gender
            });
            return res.status(201).json(passport);
        } catch (err) {
            console.log(err);
            res.status(422).json({ message: "Ошибка отправки данных", err });
        }
    }

    async getPassportById(req, res) {
        try {
            const passport = await db.passportModel.findByPk(req.params["id"]);
            return res.status(200).json(passport);
        } catch (err) {
            console.log(err);
            res.status(422).json({ message: "Ошибка получения данных", err });
        }
    }

    async updatePassportById(req, res) {
        try {
            const { 
                first_name: first_name,
                last_name: last_name,
                patronymic: patronymic,
                series: series,
                number: number,
                issued_by: issued_by,
                issued_date: issued_date,
                birth_date: birth_date,
                code: code,
                gender: gender
            } = req.body;
            await db.passportModel.update({ 
                first_name: first_name,
                last_name: last_name,
                patronymic: patronymic,
                series: series,
                number: number,
                issued_by: issued_by,
                issued_date: issued_date,
                birth_date: birth_date,
                code: code,
                gender: gender
            },{
                where: {
                    id: req.params["id"]
                }
            });
            const passport = await db.passportModel.findByPk(req.params["id"]);
            return res.status(200).json(passport);
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }

    async deletePassportById(req, res) {
        try {
            await db.passportModel.destroy({
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

    async searchPassport(req, res) {
        try {
            const { text: text } = req.body;
            const { size } = req.query;
            const page = req.query.page - 1;
            const { limit, offset } = getPagination(page, SEARCH_PASSPORT_PAGINATE);

            const passports = await db.passportModel.findAndCountAll({
                raw: true,
                limit, 
                offset,
                where: {
                    [Op.or]: {
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
                        ),
                        series: { [Op.like]: text + '%' },
                        number: { [Op.like]: text + '%' },
                        issued_by: { [Op.like]: text + '%' },
                        issued_date: { [Op.like]: text + '%' },
                        birth_date: { [Op.like]: text + '%' },
                        code: { [Op.like]: text + '%' }
                    }
                }
                // limit: 10
            });     

            return res.status(200).json(passports);
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }

    async searchPassportBySeriesAndNumber(req, res) {
        try {
            const { series: series, number: number,  } = req.query;

            const passports = await db.passportModel.findAll({
                raw: true,
                where: {
                    [Op.or]: {
                        series: series,
                        number: number
                    }
                }
                // limit: 10
            });     

            return res.status(200).json(passports);
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }
}

export default new PassportController;