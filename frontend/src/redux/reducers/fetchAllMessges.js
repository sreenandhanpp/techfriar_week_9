import { USER } from "../constants/user";

let initialState = {
  loading: false,
  error: "",
  allMessages: [],
};

export const allMessagesReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER.FETCH_ALL_MESSAGES_REQUEST:
      return { ...state, loading: true };
    case USER.FETCH_ALL_MESSAGES_SUCCESS:
      return { ...state, loading: false, allMessages: action.payload };
    case USER.FETCH_ALL_MESSAGES_FAILED:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
