import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'

import { SearchQuery } from '~/models/request/search.request'
import searchService from '~/services/search.services'
import { COMMENTS_MESSAGES } from '~/constants/messsage'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await searchService.search({
    limit,
    page,
    content: req.query.content,
    user_id: req.decoded_authorization?.user_id as string,
    media_type: req.query.media_type,
    people_following: req.query.people_following
  })
  res.json({
    message: COMMENTS_MESSAGES.SEARCH_SUCCESSFULLY,
    result: {
      result: result.tweets,
      limit,
      page,
      total_result: result.total
    }
  })
}
