import { getItem } from "../../localStorage/getItem";
import { USER } from "../constants/user";

let initialState = {
  loading: false,
  error: "",
  users: [],
};

// Function to mark users as online
const markUsersOnline = (users, onlineUserIds) => {
  return users.map((user) => ({
    ...user,
    online: onlineUserIds.some((id) => id === user._id),
  }));
};

export const allUsersReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER.FETCH_ALL_USERS_REQUEST:
      return { ...state, loading: true };
    case USER.UPDATE_USERS_STATUS:
      const usersWithOnlineStatus = markUsersOnline(
        state.users,
        action.payload
      );
      return { ...state, loading: false, users: usersWithOnlineStatus };
    case USER.FETCH_ALL_USERS_SUCCESS:
      return { ...state, loading: false, users: action.payload };
    case USER.FETCH_ALL_USERS_FAILED:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
