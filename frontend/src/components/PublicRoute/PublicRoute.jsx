import { Navigate, Outlet } from 'react-router-dom';
import { getItem } from '../../localStorage/getItem';

const user = getItem('user');

const useAuth = () => {

    if (user) {
        return false;
    } else {
        return true;
    }
}

const PublicRoute = () => {
    const auth = useAuth();
    return auth ? <Outlet /> : <Navigate to={'/'} />
};

export default PublicRoute;
