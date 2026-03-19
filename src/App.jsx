import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './layout/Layout';

const CreateMock = lazy(() => import('./pages/CreateMock'));
const Base64Tool = lazy(() => import('./pages/Base64Tool'));
const ColorConverter = lazy(() => import('./pages/ColorConverter'));
const CronExpression = lazy(() => import('./pages/CronExpression'));
const EditMock = lazy(() => import('./pages/EditMock'));
const FileDifference = lazy(() => import('./pages/FileDifference'));
const HashGenerator = lazy(() => import('./pages/HashGenerator'));
const HomePage = lazy(() => import('./pages/HomePage'));
const HttpStatusLookup = lazy(() => import('./pages/HttpStatusLookup'));
const JsonDiff = lazy(() => import('./pages/JsonDiff'));
const JsonFormatter = lazy(() => import('./pages/JsonFormatter'));
const JwtDecoder = lazy(() => import('./pages/JwtDecoder'));
const KubernetesManifest = lazy(() => import('./pages/KubernetesManifest'));
const MockList = lazy(() => import('./pages/MockList'));
const OpenApiWorkbench = lazy(() => import('./pages/OpenApiWorkbench'));
const QueryParamBuilder = lazy(() => import('./pages/QueryParamBuilder'));
const RegexCheck = lazy(() => import('./pages/RegexCheck'));
const TextCaseConverter = lazy(() => import('./pages/TextCaseConverter'));
const TimestampConverter = lazy(() => import('./pages/TimestampConverter'));
const TinyUrlPage = lazy(() => import('./pages/TinyUrlPage'));
const UrlEncoder = lazy(() => import('./pages/UrlEncoder'));
const UuidGenerator = lazy(() => import('./pages/UuidGenerator'));
const XmlFormatter = lazy(() => import('./pages/XmlFormatter'));
const YamlFormatter = lazy(() => import('./pages/YamlFormatter'));

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

          <Route path="base64-tool" element={<Base64Tool />} />
          <Route path="color-converter" element={<ColorConverter />} />
          <Route path="cron-expression" element={<CronExpression />} />
          <Route path="file-difference" element={<FileDifference />} />
          <Route path="hash-generator" element={<HashGenerator />} />
          <Route path="http-status-lookup" element={<HttpStatusLookup />} />
          <Route path="json-diff" element={<JsonDiff />} />
          <Route path="json-formatter" element={<JsonFormatter />} />
          <Route path="jwt-decoder" element={<JwtDecoder />} />
          <Route path="kubernetes-manifest" element={<KubernetesManifest />} />
          <Route path="openapi-workbench" element={<OpenApiWorkbench />} />
          <Route path="query-param-builder" element={<QueryParamBuilder />} />
          <Route path="regex-check" element={<RegexCheck />} />
          <Route path="text-case-converter" element={<TextCaseConverter />} />
          <Route path="tiny-url" element={<TinyUrlPage />} />
          <Route path="timestamp-converter" element={<TimestampConverter />} />
          <Route path="url-encoder" element={<UrlEncoder />} />
          <Route path="uuid-generator" element={<UuidGenerator />} />
          <Route path="xml-formatter" element={<XmlFormatter />} />
          <Route path="yaml-formatter" element={<YamlFormatter />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
