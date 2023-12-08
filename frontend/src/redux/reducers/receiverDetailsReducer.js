import { setItem } from "../../localStorage/setItem";
import { USER } from "../constants/user";

let initialState = {
  loading: false,
  error: "",
  receiverData: {},
};

export const receiverDetailsReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER.FETCH_USER_DETAILS_REQUEST:
      return { ...state, loading: true };
    case USER.FETCH_USER_DETAILS_SUCCESS:
      setItem('receiver',action.payload)
      return { ...state, loading: false, receiverData: action.payload };
    case USER.FETCH_USER_DETAILS_FAILED:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
