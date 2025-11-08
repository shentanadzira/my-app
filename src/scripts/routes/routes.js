import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import MapPage from '../pages/map-page';
import AddStoryPage from '../pages/add/add-story';

const routes = {
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/map': new MapPage(),
  '/add': new AddStoryPage(),
};

export default routes;
