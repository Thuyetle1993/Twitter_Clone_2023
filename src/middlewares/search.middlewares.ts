import { checkSchema } from "express-validator";
import { MediaTypeQuery, PeopleFollowing } from "~/constants/enum";
import { SEARCH_MESSAGES } from "~/constants/messsage";
import { validate } from "~/utils/validation";


export const searchValidator = validate(
    checkSchema({
        content: {
            isString: {
                errorMessage: SEARCH_MESSAGES.CONTENT_MUST_BE_STRING
            }
        },
        media_type: {
            optional: true,
            isIn: {
                options: [Object.values(MediaTypeQuery)]
            },
            errorMessage: `Media type must be one of ${Object.values(MediaTypeQuery).join(', ')}`
        },
        people_following: {
            optional: true,
            isIn: {
                options: [Object.values(PeopleFollowing)],
                errorMessage: SEARCH_MESSAGES.PEOPLE_FOLLOWING_MUST_BE_0_OR_1
            }
        }
    }, ['query'])
)