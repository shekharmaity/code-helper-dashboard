import { Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout';
import CreateMock from './pages/CreateMock';
import EditMock from './pages/EditMock';
import MockList from './pages/MockList';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MockList />} />
        <Route path="/create" element={<CreateMock />} />
        <Route path="/edit/:id" element={<EditMock />} />
      </Routes>
    </Layout>
  );
}

export default App;
