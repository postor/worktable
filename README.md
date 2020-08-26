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

## 更多

要上产线还要更新 Dockerfile 等，因为很多不是针对 ts 环境的