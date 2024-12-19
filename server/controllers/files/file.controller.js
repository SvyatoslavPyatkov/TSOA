import db from '../../models/index.js';
const Op = db.Sequelize.Op;
import fs from 'fs';
import { SEARCH_TYPES_LIMIT, SEARCH_TYPES_PAGE_SIZE } from '../../config/pagination.config.js';
import { getPagination } from '../../helpers/pagination.helper.js';

import { __dirname } from '../../server.js';

class FileController {
    async getFileTypes(req, res) {
        try {
            const { size } = req.query;
            const page = req.query.page - 1;
            const { limit, offset } = getPagination(page, SEARCH_TYPES_LIMIT);

            const fileTypes = await db.fileTypeModel.findAll({
                limit, 
                offset
            });

            return res.status(200).json(fileTypes);
        } catch (err) {
            console.log(err);
            return res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }

    async createFileType(req, res) {
        try {
            const { name } = req.body;
            const candidate = await db.fileTypeModel.findOne({ where: { name: name } });
            if (candidate) {
                return res.status(400).json({ message: "Данный тип файла уже существует" })
            }

            const form = await db.fileTypeModel.create({
                name: name
            });
            return res.status(201).json(form);
        } catch (err) {
            console.log(err);
            res.status(422).json({ message: "Ошибка отправки данных", err });
        }
    }

    async updateFileTypeById(req, res) {
        try {
            const { name } = req.body;
            await db.fileTypeModel.update({ 
                name: name
            },{
                where: {
                    id: req.params["id"]
                }
            });
            const form = await db.fileTypeModel.findByPk(req.params["id"]);
            return res.status(200).json(form);
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }

    async deleteFileTypeById(req, res) {
        try {
            await db.fileTypeModel.destroy({
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

    async searchFileType(req, res) {
        try {
            const { name } = req.query;
            const { size } = req.query;
            const page = req.query.page - 1;
            const { limit, offset } = getPagination(page, SEARCH_TYPES_PAGE_SIZE);

            const forms = await db.fileTypeModel.findAndCountAll({
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

////////////////////////////////////////////////////

    async createFile(req, res) {
        try {
            const { id } = req.user;
            const { file_type_id } = req.body;
            const { filename, originalname } = req.file;
            const name = originalname.split('.', 2);
            if (req.file == undefined) {
                return res.status(400).json({ message: "Файл не был загружен" });
            }
            const candidate = await db.fileModel.findOne({ 
                where: {
                    id: filename,
                    original_file_name: name[0],
                    extension: name[1],
                    file_type_id: file_type_id,
                    user_id: id
                } 
            });
            if (candidate) {
                return res.status(400).json({ message: "Данный тип файла уже существует" })
            }
            const file = await db.fileModel.create({
                id: filename,
                original_file_name: name[0],
                extension: name[1],
                file_type_id: file_type_id,
                user_id: id
            });



            return res.status(201).json(file);
        } catch (err) {
            return res.status(403).json({message: "Ошибка при загрузке файла", err});
        }
    }

    async getFileById(req, res) {
        try {
            const file = await db.fileModel.findByPk(req.params["id"]);
            if (!file) {
                return res.status(403).json({message: "Ошибка при выгрузке файла", err});
            }
            const filePath = __dirname + '\\uploads\\' + file.id;
            const originalFileName = file.original_file_name + '.' + file.extension;

            await res.download(filePath, originalFileName, (err) => {
                if (err) {
                    console.log("Ошибка выгрузки файла " + err)
                    return res.status(422).json({ message: "Ошибка получения данных", err });
                }
            })
        } catch (err) {
            console.log(err);
            res.status(422).json({ message: "Ошибка получения данных", err });
        }
    }

    async deleteFileById(req, res) {
        try {
            const file = await db.fileModel.findByPk(req.params["id"]);
            await db.fileModel.destroy({
                where: {
                    id: req.params["id"]
                }
            });
            const filePath = __dirname + '\\uploads\\' + file.id;
            const directoryPath = __dirname;

            fs.unlink(filePath, function(err) {
                if(err) return console.log(err);
                console.log('Файл успешно удалён');
            });
            return res.status(204).json();
        } catch (err) {
            console.log(err);
            res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }

    async getAllFiles(req, res) {
        try {
            const files = await db.groupModel.findAll({
                include: [{
                    model: db.fileModel,
                    through: {
                        attributes: []
                    },
                    include: {
                        model: db.fileTypeModel
                    }
                }]
            });

            return res.status(200).json(files);
        } catch (err) {
            console.log(err);
            return res.status(400).json({ message: "Ошибка получения данных", err });
        }
    }
}

export default new FileController;