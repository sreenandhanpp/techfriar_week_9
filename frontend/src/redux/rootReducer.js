import { combineReducers } from "redux";
import { signupReducer } from "./reducers/signupReducer";
import { allUsersReducer } from "./reducers/allUsersReducer";
import { receiverDetailsReducer } from "./reducers/receiverDetailsReducer";
import { signinReducer } from "./reducers/signInReducer";
import { allMessagesReducer } from "./reducers/fetchAllMessges";

export const rootReducers = combineReducers({
  signup: signupReducer,
  allUsers: allUsersReducer,
  receiverDetails: receiverDetailsReducer,
  signin: signinReducer,
  allMessages: allMessagesReducer,
});
