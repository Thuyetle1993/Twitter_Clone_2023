import { Router } from "express";
import { searchController } from "~/controllers/search.controllers";
import { searchValidator } from "~/middlewares/search.middlewares";
import { paginationValidator } from "~/middlewares/tweets.middlewares";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";
const seachRouter = Router()

seachRouter.get('/', accessTokenValidator, verifiedUserValidator,searchValidator, paginationValidator,wrapRequestHandler(searchController) )

export default seachRouter