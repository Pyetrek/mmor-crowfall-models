```
source .venv/bin/activate
pip install tensorflowjs[wizard]
tensorflowjs_wizard
npm install --global http-server
```

## Running benchmark
```
http-server --cors
https://tensorflow.github.io/tfjs/e2e/benchmarks/local-benchmark/index.html
```

modelUrl: `http://localhost:8080/model/model.json`
backend: `webgl`
Inputs shape: `1,640,640,3`
