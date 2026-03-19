import axios from 'axios';
import { useState } from 'react';

export default function PostmanRunner() {
  const [results, setResults] = useState([]);

  const runCollection = async (collectionJson) => {
    const collection = JSON.parse(collectionJson);
    const newResults = [];

    for (const item of collection.item) {
      const req = item.request;
      const url = req.url.raw;
      const method = req.method || 'GET';
      const body = req.body?.raw || null;
      const headers = req.header?.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

      let response;
      try {
        const res = await axios({ method, url, data: body, headers });
        const resBody = res.data;
        const resCode = res.status;
        let output = [];

        // ✅ Run Postman-style test scripts
        const pm = {
          response: {
            code: resCode,
            text: () => JSON.stringify(resBody),
          },
          test: (name, fn) => {
            try {
              fn();
              output.push({ name, result: 'PASS' });
            } catch (err) {
              output.push({ name, result: 'FAIL', message: err.message });
            }
          },
          expect: (actual) => ({
            to: {
              equal: (exp) => {
                if (actual !== exp) throw new Error(`Expected ${actual} to equal ${exp}`);
              },
              include: (substr) => {
                if (!actual.toString().includes(substr))
                  throw new Error(`Expected body to include '${substr}'`);
              },
            },
          }),
        };

        // Run all scripts
        if (item.event) {
          for (const e of item.event) {
            if (e.listen === 'test') {
              for (const script of e.script) {
                const js = script.exec.join('\n');
                // Execute safely using Function constructor
                new Function('pm', js)(pm);
              }
            }
          }
        }

        newResults.push({
          name: item.name,
          status: resCode,
          tests: output,
        });
      } catch (error) {
        newResults.push({
          name: item.name,
          error: error.message,
        });
      }
    }

    setResults(newResults);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const text = await file.text();
    runCollection(text);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🧪 Frontend Postman Runner</h2>
      <input type="file" accept=".json" onChange={handleFileUpload} />
      <br />
      {results.map((r, i) => (
        <div key={i} style={{ marginTop: 15, border: '1px solid #ddd', padding: 10 }}>
          <h4>
            {r.name} —{' '}
            <span style={{ color: r.status === 200 ? 'green' : 'red' }}>{r.status || 'ERROR'}</span>
          </h4>
          {r.tests?.map((t, idx) => (
            <p key={idx} style={{ color: t.result === 'PASS' ? 'green' : 'red' }}>
              {t.result}: {t.name} {t.message && `(${t.message})`}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
