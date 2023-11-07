import { Router } from "express";
import { searchController } from "~/controllers/search.controllers";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares";
const seachRouter = Router()

seachRouter.get('/', accessTokenValidator, verifiedUserValidator, searchController)

export default seachRouter