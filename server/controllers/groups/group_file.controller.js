import db from '../../models/index.js';
import { FILES_PAGE_SIZE } from '../../config/pagination.config.js';
import { getPagination } from '../../helpers/pagination.helper.js';
import { storageFolder } from '../../config/multer.config.js';
const Op = db.Sequelize.Op;
const fn = db.Sequelize.fn;
const col = db.Sequelize.col;
const where = db.Sequelize.where;

class GroupFileController {

    async getGroupDocuments(req, res) {
        try {
            const { size } = req.query;
            const page = req.query.page - 1;
            const { limit, offset } = getPagination(page, FILES_PAGE_SIZE);

            const files = await db.fileModel.findAll({
                limit, 
                offset,
                include: [{
                    model: db.groupModel,
                    through: {
                        attributes: []
                    },
                    where: {
                        id: req.params["id"]
                    },
                    attributes: []
                }, {
                    model: db.fileTypeModel 
                }],
                attributes: [
                    'id',
                    'user_id',
                    [fn('concat', col('file.id'), '.', col('file.extension')),'url'],
                    [fn('concat', col('file.original_file_name'), '.', col('file.extension')), 'original_file_name']
                ],
            });

            return res.status(200).json(files);
        } catch (err) {
            console.log(err);
            res.status(422).json({ message: "Ошибка получения данных", err });
        }
    }

    async createGroupDocument(req, res) {
        try {
            const GroupModel = db.groupModel;
            const FileModel = db.fileModel;

            const group_id = req.params["id"];
            const group = await GroupModel.findByPk(group_id);
            if (!group) {
                return res.status(400).json({ message: `Группа ${group.name} не найдена` })
            }

            const user = req.user;
            const { file_type_id } = req.body;
            const { filename, originalname } = req.file;
            const name = originalname.split('.', 2);
            if (req.file == undefined) {
                return res.status(400).json({ message: "Файл не был загружен" });
            }
            const candidate = await FileModel.findOne({ 
                where: {
                    id: filename,
                    original_file_name: name[0],
                    extension: name[1],
                    file_type_id: file_type_id,
                    user_id: user.id
                } 
            });
            if (candidate) {
                return res.status(400).json({ message: `Файл с именем ${originalname} уже существует` })
            }
            const file = await FileModel.create({
                id: filename,
                original_file_name: name[0],
                extension: name[1],
                file_type_id: file_type_id,
                user_id: user.id
            });

            await group.addFile(file);
            const fetchedFileModel = await FileModel.findOne({
                include: [{
                    model: db.fileTypeModel
                }],
                attributes: [
                    'id',
                    'user_id',
                    [fn('concat', col('file.id'), '.', col('file.extension')),'url'],
                    [fn('concat', col('file.original_file_name'), '.', col('file.extension')),'original_file_name']
                ]
            });

            return res.status(201).json(fetchedFileModel);
        } catch (err) {
            console.log(err)
            return res.status(403).json({message: "Ошибка при загрузке файла", err});
        }
    }
}

export default new GroupFileController;