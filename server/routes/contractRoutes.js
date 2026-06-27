import express from 'express';
import { 
  createContract, 
  getContracts, 
  sendContract, 
  signContract, 
  storeHash 
} from '../controllers/contract.controller.js';

const router = express.Router();

router.post('/create', createContract);
router.get('/', getContracts);
router.post('/send', sendContract);
router.post('/sign', signContract);
router.post('/store-hash', storeHash);

export default router;
