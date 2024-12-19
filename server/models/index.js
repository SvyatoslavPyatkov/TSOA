import Sequelize from 'sequelize';
import dbConfig from '../config/db.config.js';

import learnerModel from './learners/learner.model.js';
import passportModel from './learners/passport.model.js';
import jobModel from './learners/job.model.js';
import learnerFileModel from './learners/learner_file.model.js';

import groupModel from './groups/group.model.js';
import groupFileModel from './groups/group_file.model.js';

import eduProgramModel from './educationPrograms/education_program.model.js';
import eduFormModel from './educationPrograms/education_form.model.js';

import fileModel from './files/file.model.js';
import fileTypeModel from './files/file_type.model.js';

import userModel from './authorization/user.model.js';


const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    dialect: dbConfig.dialect,
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    define: dbConfig.define,
    operatorsAliases: false
    // logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.learnerModel = learnerModel(sequelize, Sequelize);
db.passportModel = passportModel(sequelize, Sequelize);
db.jobModel = jobModel(sequelize, Sequelize);
db.learnerFileModel = learnerFileModel(sequelize, Sequelize);

db.groupModel = groupModel(sequelize, Sequelize);
db.groupFileModel = groupFileModel(sequelize, Sequelize);

db.eduProgramModel = eduProgramModel(sequelize, Sequelize);
db.eduFormModel = eduFormModel(sequelize, Sequelize);

db.fileModel = fileModel(sequelize, Sequelize);
db.fileTypeModel = fileTypeModel(sequelize, Sequelize);

db.userModel = userModel(sequelize, Sequelize);


// Связи отношений базы данных

//passports и learners 1:M
db.passportModel.hasMany(db.learnerModel, {
    foreignKey: 'passport_id'
});
db.learnerModel.belongsTo(db.passportModel, {
    foreignKey: 'passport_id'
});

//jobs и learners 1:M
db.jobModel.hasMany(db.learnerModel, {
    foreignKey: 'job_id'
});
db.learnerModel.belongsTo(db.jobModel, {
    foreignKey: 'job_id'
});

// learners и files M:N
db.learnerModel.belongsToMany(db.fileModel, {
    through: db.learnerFileModel,
    foreignKey: 'learner_id'
});
db.fileModel.belongsToMany(db.learnerModel, {
    through: db.learnerFileModel,
    foreignKey: 'file_id' 
});

// groups и learners 1:M
db.groupModel.hasMany(db.learnerModel, {
    foreignKey: 'group_id'
});
db.learnerModel.belongsTo(db.groupModel, {
    foreignKey: 'group_id'
})

// education_programs и groups 1:M
db.eduProgramModel.hasMany(db.groupModel, {
    foreignKey: 'education_program_id'
});
db.groupModel.belongsTo(db.eduProgramModel, {
    foreignKey: 'education_program_id'
});

// education_forms и groups 1:M
db.eduFormModel.hasMany(db.eduProgramModel, {
    foreignKey: 'education_form_id'
});
db.eduProgramModel.belongsTo(db.eduFormModel, {
    foreignKey: 'education_form_id'
});

// groups и files M:N
db.groupModel.belongsToMany(db.fileModel, {
    through: db.groupFileModel,
    foreignKey: 'group_id'
});
db.fileModel.belongsToMany(db.groupModel, {
    through: db.groupFileModel,
    foreignKey: 'file_id' 
});

// file_types и files 1:M
db.fileTypeModel.hasMany(db.fileModel, {
    foreignKey: 'file_type_id' 
});
db.fileModel.belongsTo(db.fileTypeModel, {
    foreignKey: 'file_type_id' 
});


// users и files 1:M
db.userModel.hasMany(db.fileModel, {
    foreignKey: 'user_id' 
});

export default db;