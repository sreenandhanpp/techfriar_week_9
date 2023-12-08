import { USER } from "../constants/user";
import { setItem } from '../../localStorage/setItem'

let initialState = {
  loading: false,
  error: "",
  userData: {},
};

export const signinReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER.SIGNIN_REQUEST:
      return { ...state, loading: true };
    case USER.SIGNIN_SUCCESS:
      setItem("user", action.payload);
      return { ...state, loading: false, userData: action.payload };
    case USER.SIGNIN_FAILED:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
