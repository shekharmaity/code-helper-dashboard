import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout';

const CreateMock = lazy(() => import('./pages/CreateMock'));
const CronExpression = lazy(() => import('./pages/CronExpression'));
const EditMock = lazy(() => import('./pages/EditMock'));
const FileDifference = lazy(() => import('./pages/FileDifference'));
const HomePage = lazy(() => import('./pages/HomePage'));
const JsonFormatter = lazy(() => import('./pages/JsonFormatter'));
const MockList = lazy(() => import('./pages/MockList'));
const RegexCheck = lazy(() => import('./pages/RegexCheck'));
const TinyUrlPage = lazy(() => import('./pages/TinyUrlPage'));
const UuidGenerator = lazy(() => import('./pages/UuidGenerator'));
const XmlFormatter = lazy(() => import('./pages/XmlFormatter'));

const fallbackStyles = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  color: '#475569',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '14px',
};

export default function App() {
  return (
    <Suspense fallback={<div style={fallbackStyles}>Loading workspace...</div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="mocks" element={<MockList />} />
          <Route path="create" element={<CreateMock />} />
          <Route path="edit/:id" element={<EditMock />} />

          <Route path="cron-expression" element={<CronExpression />} />
          <Route path="file-difference" element={<FileDifference />} />
          <Route path="json-formatter" element={<JsonFormatter />} />
          <Route path="regex-check" element={<RegexCheck />} />
          <Route path="tiny-url" element={<TinyUrlPage />} />
          <Route path="uuid-generator" element={<UuidGenerator />} />
          <Route path="xml-formatter" element={<XmlFormatter />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
