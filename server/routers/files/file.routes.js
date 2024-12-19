import express from 'express';
export const router = express.Router();
import controller from '../../controllers/files/file.controller.js';
import authMidleware from '../../middleware/auth.midleware.js';

router.get('/files/types', authMidleware, controller.getFileTypes);
router.post('/files/types', authMidleware, controller.createFileType);
router.put('/files/:id/file', authMidleware, controller.updateFileTypeById);
router.delete('/files/types/:id', authMidleware, controller.deleteFileTypeById);
router.post('/files/types/search', authMidleware, controller.searchFileType);

router.get('/files/:id/file', authMidleware, controller.getFileById);
// router.delete('/files/:id/file', authMidleware, controller.deleteFileById);

// router.post('/files', authMidleware, authMidleware, controller.createFile);
// router.get('/files', authMidleware, controller.getAllFiles);