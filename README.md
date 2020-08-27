# moleculer-mongo-react

构建一个 moleculer+mongodb+react 的示例项目

# 步骤

1. 创建 moleculer 项目，这里使用 TS 模板，因为 TS 在复杂/嵌套结构的自动提示能够提高开发效率

```
PS D:\study\moleculer-mongo-react> cd ..
PS D:\study> moleculer init project-typescript moleculer-mongo-react

Template repo: moleculerjs/moleculer-template-project-typescript
? Add API Gateway (moleculer-web) service? Yes
? Would you like to communicate with other nodes? Yes
? Select a transporter NATS (recommended)
? Would you like to use cache? No
? Add DB sample service? Yes
? Would you like to enable metrics? Yes
? Select a reporter solution Prometheus
? Would you like to enable tracing? Yes
? Select a exporter solution Console
? Add Docker & Kubernetes sample files? Yes
? Use ESLint to lint your code? Yes
? The 'moleculer-mongo-react directory is exists! Continue? Yes
? Would you like to run 'npm install'? Yes

Running 'npm install'...
```

验证下安装，运行

```
npm run dev
```

然后打开 `http://localhost:3000/api/products` 就可以看到 product 的 db 服务

```
PS D:\study> Invoke-WebRequest http://localhost:3000/api/products | Select -ExpandProperty Content
{"rows":[{"_id":"9MwZHBrcvdHbRam8","name":"Huawei P30 Pro","quantity":15,"price":679},{"_id":"UxcWThkestwNYJtF","name":"Samsung Galaxy S10 Plus","quantity":10,"price":704},{"_id":"mPqz5bNhABRMiWC1","name":"iPhone 11 Pro","quantity":25,"price":999}],"total":3,"page":1,"pageSize":10,"totalPages":1}
```

为什么没有配置数据库，db 服务就能用了呢？这也是我喜欢 moleculer 很重要的原因，开发环境使用 nedb 替代 mongodb，而且最新版本已经 0 配置了，之前是需要一点手工配置的，细节可以看下 `mixins/db.mixin.ts`

```
public start(){
			if (process.env.MONGO_URI) {
				// Mongo adapter
				const   MongoAdapter = require("moleculer-db-adapter-mongo");

				this.schema.adapter = new MongoAdapter(process.env.MONGO_URI);
				this.schema.collection = this.collection;
			} else if (process.env.TEST) {
				// NeDB memory adapter for testing
				// @ts-ignore
				this.schema.adapter = new DbService.MemoryAdapter();
			} else {
				// NeDB file DB adapter

				// Create data folder
				if (!existsSync("./data")) {
					sync("./data");
				}
				// @ts-ignore
				this.schema.adapter = new DbService.MemoryAdapter({ filename: `./data/${this.collection}.db` });
			}

		return this.schema;
	}
```

刚好发现 lint 标红了这一句

```
const   MongoAdapter = require("moleculer-db-adapter-mongo")
```

lint 提示： `Require statement not part of import statement.eslint@typescript-eslint/no-var-requires` 意思是说这里用了 require，这个不应该再出现了，简单解决就允许 require，修改 .eslintrc.js 注释相关代码即可

```
// "@typescript-eslint/no-var-requires": "error"
```

2. 添加 react

如果使用独立的前端项目，只需要把 gateway 加上 cors 就可以了。如果集成到一个项目，本身 moleculer 就准备了 public 目录，所以只要吧 react 源码构建到 public 中就可以了，现在 public 中有查看服务状态的代码，需要的话自己备份下。

```
npm i webpack webpack-cli react react-dom @types/react @types/react-dom typescript  ts-loader html-webpack-plugin axios  --save-dev
```

配置 webpack 和增加 react 代码，详见  [./webpack.config.js](./webpack.config.js) 和 [./web](./web)，然后用 webpack --watch 就可以自动重编了（需要的自己配置hot-reload，开发环境自动刷新）

```
npm run webpack --watch
```

## 部署

docker-compose 部署

```
docker-compose up -d --build

Invoke-WebRequest http://localhost:3000/ | Select -ExpandProperty Content
<div id="app"></div><script src="main.50e2619038cdd8b5b9cf.js"></script>
```
浏览器访问 http://localhost:3000 的话脚本就会执行，显示加载的接口数据


k8s 部署先推到 dockerhub（实际项目请使用私有仓库）

```
PS D:\study\moleculer-mongo-react> docker tag moleculer-mongo-react postor/moleculer-mongo-react
PS D:\study\moleculer-mongo-react> docker push postor/moleculer-mongo-react
The push refers to repository [docker.io/postor/moleculer-mongo-react]
8a65a95bfe3a: Pushed
0d9e322b59ed: Pushed
756f1f010623: Pushed
5723605172dd: Pushed
978fc9d4df6f: Pushed
42ea82e68585: Pushed
2d18ec18ec13: Pushed
d881775a5092: Pushed
aedafbecb0b3: Mounted from library/node
db809908a198: Mounted from library/node
1b235e8e7bda: Mounted from library/node
3e207b409db3: Mounted from library/node
latest: digest: sha256:833d1a917041487e90f807faf53dd9a1ca6fa2c30997e6e363bcab9e1912784a size: 2830

```

然后修改 k8s.yaml 使用 dockerhub 上的镜像名 postor/moleculer-mongo-react （不修改的话集群中其他机器无法获取 moleculer-mongo-react），同时改了一些环境变量（之前都是针对 js 项目的，改成 ts 项目需要修改响应值）

然后在集群上应用 k8s.yaml

```
PS D:\study\moleculer-mongo-react> kubectl create -f .\k8s.yaml
configmap/common-env created
service/api created
ingress.networking.k8s.io/ingress created
deployment.apps/api created
deployment.apps/greeter created
deployment.apps/products created
statefulset.apps/mongo created
persistentvolumeclaim/mongo-data created
service/mongo created
service/nats created
deployment.apps/nats created

PS D:\study\moleculer-mongo-react> kubectl get services
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)     AGE
api          ClusterIP   10.106.44.7     <none>        3000/TCP    12m
kubernetes   ClusterIP   10.96.0.1       <none>        443/TCP     3h6m
mongo        ClusterIP   10.101.7.81     <none>        27017/TCP   12m
nats         ClusterIP   10.105.246.10   <none>        4222/TCP    12m

```

因为 service 是不可以在集群外访问的，宿主机当然也是集群外，所以需要加 ingress 或者负载均衡，这里要先安装 ingress (参考 https://kubernetes.github.io/ingress-nginx/deploy/)

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.34.1/deploy/static/provider/cloud/deploy.yaml
```

等到 controller 状态为 running，ingress就能用了

```
PS D:\study\moleculer-mongo-react> kubectl get pods -n ingress-nginx
NAME                                        READY   STATUS      RESTARTS   AGE
ingress-nginx-admission-create-p9dtc        0/1     Completed   0          12m
ingress-nginx-admission-patch-p8q8t         0/1     Completed   0          12m
ingress-nginx-controller-6967fb79f6-gz2p7   1/1     Running     0          13m
```

之前的 k8s.yaml 中已经创建了 ingress 对象，所以配置 host 就可以打开链接看看了

```
PS D:\study\moleculer-mongo-react> kubectl get ingress
NAME      HOSTS                                    ADDRESS     PORTS   AGE
ingress   moleculer-mongo-react.127.0.0.1.nip.io   localhost   80      93m

PS D:\study\moleculer-mongo-react> Invoke-RestMethod -Headers @{'Host'='moleculer-mongo-react.127.0.0.1.nip.io'} http://localhost
<div id="app"></div><script src="main.50e2619038cdd8b5b9cf.js"></script>
```

![screenshot](./screenshot.jpg)