import { BrowserRouter, Routes, Route } from 'react-router';
import LandingPage from '@/pages/landing';
import ExplorerPage from '@/pages/explorer';

const Routing = () => (
  <BrowserRouter>
    <Routes>
      <Route index element={<LandingPage />} />
      <Route path="/vault/*" element={<ExplorerPage />} />
    </Routes>
  </BrowserRouter>
);

export default Routing;
