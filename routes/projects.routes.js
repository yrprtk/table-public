const {Router} = require('express');
const router = Router();
const Project = require('../models/Project');
const Regions = require('../models/Regions');
const Equipments = require('../models/Equipments');
const isAuth = require('../middleware/isAuth.middleware');

router.post('/', isAuth, async(req, res)=>{
    try {
        if(['adminAll','adminPrivat','adminBudget','seller'].includes(req.headers.user_role)){
            if(req.headers.user_role=='seller'){req.body.user_email = req.headers.user_email};
            req.body.lastUpdate = new Date();
            let newProject = await Project.create(req.body);
            return res.status(200).send(newProject._id);
        } else {
            throw new Error(`you role cannot add projects`);
        }
    } catch (error) {
        let err = `Error in post project.routes: ${error.message}; user_email: ${req.headers.user_email}; user_role: ${req.headers.user_role}; req.body: ${req.body}`;
        console.log(err);
        res.status(500).send(err);
    }
})

router.delete('/:id', isAuth, async(req, res)=>{
    try {
        let deleteObj = { _id : req.params['id'] };
        switch (req.headers.user_role) {
            case 'adminAll': break;
            case 'adminPrivat': deleteObj['financingSource'] = 'приватне'; break;
            case 'adminBudget': deleteObj['financingSource'] = 'бюджетне'; break;
            default: throw new Error(`you role cannot delete projects`);
        }
        await Project.updateOne(deleteObj, {isDelete: true});
        return res.status(200).send("ok");
    } catch (error) {
        let err = `Error in delete project.routes: ${error.message}; user_email: ${req.headers.user_email}; user_role: ${req.headers.user_role}; project_id ${req.params['id']}`;
        console.log(err);
        res.status(500).send(err);
    }
})

router.patch('/:id', isAuth, async(req, res)=>{
    try {
        let patchObj = { _id : req.params['id'] };
        switch (req.headers.user_role) {
            case 'adminAll': break;
            case 'adminPrivat': patchObj['financingSource'] = 'приватне'; break;
            case 'adminBudget': patchObj['financingSource'] = 'бюджетне'; break;
            case 'seller': patchObj['user_email'] = req.headers.user_email; break;
            case 'productUltrasound': patchObj['equipmentType'] = 'УЗД'; break;
            case 'productMrt': patchObj['equipmentType'] = 'МРТ'; break;
            case 'productKt': patchObj['equipmentType'] = 'КТ'; break;
            case 'productAngioX-ray': patchObj['equipmentType'] = 'Рентгенівські системи, Ангіографи'; break;
            default: throw new Error(`you role cannot patch projects`);
        }
        req.body.lastUpdate = new Date();
        await Project.updateOne(patchObj, req.body);
        return res.status(200).send("ok");
    } catch (error) {
        let err = `Error in patch project.routes: ${error.message}; user_email: ${req.headers.user_email}; user_role: ${req.headers.user_role}; project_id ${req.params['id']}; req.body: ${req.body}`;
        console.log(err);
        res.status(500).send(err);
    }
})

router.get('/', isAuth, async(req, res)=>{
    try {
        let regions = await Regions.find(), region = [], city = [];
        for (let i = 0; i < regions.length; i++){
            region.push(regions[i].region);
            city.push(regions[i].cities)
        }

        let equipments = await Equipments.find(), equipmentName = [], equipmentType = [];
        for (let i = 0; i < equipments.length; i++){
            equipmentName.push(equipments[i].equipmentName);
            equipmentType.push(equipments[i].equipmentType)
        }

        let config = {
            idTable : 'Table',
            appName : 'table',
            idContainer : 'container',
            column : ['_id', 'registrationDate', 'region', 'city', 'medicalInstitution', 'contactPersonName', 'contactPersonEmail', 'contactPersonPhone', 'contactPersonPost', 'projectPrice', 'projectСurrency', 'financingSource', 'financingSourceType', 'chance', 'projectInfo', 'equipmentType', 'equipmentName', 'helpSalesResponsible', 'kpInfo', 'notes', 'status', 'user_email'],
            heading : ['id', 'Дата регистрации проекта', 'Область', 'Город', 'Медицинское учреждение', 'Контактное лицо', 'Контактный Email', 'Контактный телефон', 'Должность контактного лица', 'Сумма проекта', 'Валюта проекта', 'Источник финансирования', 'Тип источника финансирования', 'Вероятность', 'Информация о проекте', 'Тип оборудования', 'Название оборудования', 'Какая помощь и в какие сроки необходима ответственному за продажу', '№ и дата КП, комментарий ответственного продакт специалиста', 'Примечания', 'Статус', 'user_email'],
            colWithId : 0,
            nameColWithId : '_id',
            canCreateNew : false,
            canDelete : false,
            canUpdate : false,
            colWithFilter : [1,2,3,4,7,15,16,21],
            fetchURL : '/',
            status: ['прийнято', 'розгляд', 'не прийнято'],
            projectСurrency: ['EUR', 'USD', 'UAH'],
            financingSource : ['бюджетне', 'приватне'],
            financingSourceType : [['міське', 'обласне', 'державне'], ['---']],
            selectPair : [['region', 'city'], ['equipmentType', 'equipmentName'], ['financingSource', 'financingSourceType']],
            region,
            city,
            equipmentType,
            equipmentName,
        };

        let getObj = {}; getObj['isDelete'] = {$ne: true};
        switch (req.headers.user_role) {
            case 'adminAll': break;
            case 'adminPrivat': getObj['financingSource'] = 'приватне'; break;
            case 'adminBudget': getObj['financingSource'] = 'бюджетне'; break;
            case 'seller': getObj['user_email'] = req.headers.user_email; break;
            case 'productUltrasound': getObj['equipmentType'] = 'УЗД'; break;
            case 'productMrt': getObj['equipmentType'] = 'МРТ'; break;
            case 'productKt': getObj['equipmentType'] = 'КТ'; break;
            case 'productAngioX-ray': getObj['equipmentType'] = 'Рентгенівські системи, Ангіографи'; break;
            case 'delete': getObj['isDelete'] = 'true'; break;
        }
        switch (req.headers.user_role) {
            case 'adminAll': case 'adminPrivat': case 'adminBudget':
                config.canCreateNew = true; config.canUpdate = true; config.canDelete = true; 
                config.typeArr = [['reedOnly', 'date', 'select', 'selectRelatedPrev', 'text', 'text', 'email', 'tel', 'text', 'number', 'select', 'select', 'selectRelatedPrev', 'percent', 'text', 'select', 'selectRelatedPrev', 'text', 'text', 'text', 'select']];
                config.condition = "return typeArr[0][col]";
                break;
            case 'seller':
                config.canCreateNew = true; config.canUpdate = true;
                config.typeArr = [
                    ['reedOnly', 'date', 'select', 'selectRelatedPrev', 'text', 'text', 'email', 'tel', 'text', 'number', 'select', 'select', 'selectRelatedPrev', 'reedOnly', 'writeOnly', 'select', 'selectRelatedPrev', 'text', 'writeOnly', 'writeOnly', 'reedOnly'],
                    ['reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'pereedOnlyrcent', 'writeOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'writeOnly', 'writeOnly', 'reedOnly'],
                ];
                config.condition = "if(id!='New'&&(td[20].innerText==='прийнято'||(td[20].firstElementChild!=null&&td[20].firstElementChild.innerText==='прийнято'))){return typeArr[1][col]}else{return typeArr[0][col]}";
                config.column = ['_id', 'registrationDate', 'region', 'city', 'medicalInstitution', 'contactPersonName', 'contactPersonEmail', 'contactPersonPhone', 'contactPersonPost', 'projectPrice', 'projectСurrency', 'financingSource', 'financingSourceType', 'chance', 'projectInfo', 'equipmentType', 'equipmentName', 'helpSalesResponsible', 'kpInfo', 'notes', 'status'];
                config.heading = ['id', 'Дата регистрации проекта', 'Область', 'Город', 'Медицинское учреждение', 'Контактное лицо', 'Контактный Email', 'Контактный телефон', 'Должность контактного лица', 'Сумма проекта', 'Валюта проекта', 'Источник финансирования', 'Тип источника финансирования', 'Вероятность', 'Информация о проекте', 'Тип оборудования', 'Название оборудования', 'Какая помощь и в какие сроки необходима ответственному за продажу', '№ и дата КП, комментарий ответственного продакт специалиста', 'Примечания', 'Статус'];
                config.colWithFilter = [1,2,3,4,7,15,16];
                break;
            case 'productUltrasound': case 'productMrt': case 'productKt': case 'productAngioX-ray':
                config.canUpdate = true;
                config.typeArr = [['reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'reedOnly', 'writeOnly', 'writeOnly', 'reedOnly']];
                config.condition = "return typeArr[0][col]";
                break;
            case 'delete': 
                config.canCreateNew = false; config.canUpdate = false; config.canDelete = false; 
                break;
        }
        config.tableData = await Project.find(getObj, config.column.join(' ')).sort({ lastUpdate: -1 });
        res.render('table.min.ejs', {config: JSON.stringify(config)});
    } catch (error) {
        let err = `Error in get project.routes: ${error.message}`;
        console.log(err);
        res.status(500).send(err);
    }
});

module.exports = router;