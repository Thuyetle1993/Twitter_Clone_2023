import { Router } from "express";
import { searchController } from "~/controllers/search.controllers";
const seachRouter = Router()

seachRouter.get('/', searchController)

export default seachRouter