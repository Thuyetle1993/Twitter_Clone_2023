import { MediaTypeQuery } from "~/constants/enum";
import { Pagination } from "./Tweet.request";
import { Query } from 'express-serve-static-core'
export interface SearchQuery extends Query, Pagination {
    content: string
    media_type: MediaTypeQuery
    people_following: string
}