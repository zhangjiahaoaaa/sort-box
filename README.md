# 期末救命箱

面向大学生的课程资料与 DDL 智能整理助手。

「期末救命箱」不是传统网盘，而是一个课程资料作战台：把群聊通知、课程文件、作业要求、复习资料整理成按课程归档的本地资料库和待办清单。当前版本已经跑通“上传/粘贴 -> 识别确认 -> 归档 -> 搜索 -> 预览/下载”的 MVP 闭环。

## 当前功能

- 首页 Dashboard：课程、资料、待办统计，DDL 分组，最近资料，课程概览
- 课程管理：课程列表、新建课程、课程详情页、课程删除
- 本地资料库：
  - 文件本体保存到浏览器 IndexedDB
  - 资料元数据保存到 localStorage
  - 刷新后仍可在课程页看到资料
  - 支持 PDF、图片、txt 在线预览
  - 支持 docx/pptx 等文件下载查看
- 添加资料：
  - 根据文件名 mock 推荐课程、类型、标签
  - 识别到疑似新课程时提示一键创建并使用
  - 上传 txt 时提取正文到 `extractedText`
- 粘贴通知：
  - 支持 mock 规则识别课程、事项标题、截止时间、提交方式、标签
  - 可选接入 OpenAI / DeepSeek 做通知识别
  - AI 只提供建议，必须进入确认页，用户确认后才归档
- 识别确认页：
  - 展示识别结果和通知原文
  - 支持手动修改课程、标题、DDL、提交方式、标签
  - 未知课程可一键创建
- 待办追踪：确认通知后生成待办，支持完成 / 恢复待完成 / 删除
- 期末救命搜索：
  - 搜索课程名、资料文件名、标签、备注、txt 正文
  - 搜索待办标题、截止时间、提交方式、通知原文
  - 按课程 / 资料 / 待办 / 通知分组展示
  - 展示命中字段、正文摘要和关键词高亮
- 演示数据：首次打开自动注入示例课程、资料、通知和 DDL
- 一键恢复演示数据：方便比赛现场重新开始演示

## 产品流程

1. 创建或选择课程，例如「数据库系统」「矩阵论」「大学英语」。
2. 上传课程资料，系统保存文件本体，并根据文件名推荐课程、类型和标签。
3. 进入课程详情页，查看资料列表，并预览或下载文件。
4. 粘贴群通知，例如作业要求、考试安排、展示通知。
5. 系统识别课程、事项、DDL、提交方式和标签。
6. 用户在确认页检查和修改识别结果。
7. 确认归档后，系统创建通知记录和待办事项。
8. 用户在首页搜索关键词，例如「实验三」「事务隔离」「学习通」，快速找到资料、通知和 DDL。

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- React
- lucide-react
- localStorage：保存课程、资料元数据、通知、待办
- IndexedDB：保存浏览器本地文件 Blob
- date-fns
- ESLint

当前版本不包含登录注册、云存储、后端数据库、OCR、向量数据库、QQ/微信自动导入、学习平台接口或多人协作。

## 本地运行

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

访问：

```txt
http://localhost:3000
```

如果 `localhost` 无法访问，可以尝试：

```txt
http://127.0.0.1:3000
```

## 验证命令

```bash
npm run lint
npm run build
```

如果要验证通知识别里的关键日期规则：

```bash
node scripts/test-recognition.mjs
```

## AI 配置，可选

默认不需要 AI，通知识别会使用本地 mock 规则。

如需测试 DeepSeek：

```env
NOTICE_AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的 key
DEEPSEEK_NOTICE_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

如需测试 OpenAI：

```env
NOTICE_AI_PROVIDER=openai
OPENAI_API_KEY=你的 key
OPENAI_NOTICE_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

AI 识别结果不会直接入库，仍然会进入确认页，由用户确认后归档。

## 数据说明

localStorage keys：

```txt
final-rescue.appData.v1
final-rescue.recognitionDraft.v1
```

IndexedDB：

```txt
final-rescue-file-store
```

保存的数据包括：

- `courses`：课程
- `materials`：资料元数据，包含 `fileId`、`mimeType`、`fileSize`、`extractedText`
- `todos`：DDL 待办
- `notices`：通知记录
- IndexedDB files：用户上传的文件 Blob

注意：文件保存在当前浏览器本地。换设备、换浏览器、清除浏览器数据后，本地文件可能丢失。正式版可迁移到对象存储。

## 演示路径

1. 首页展示 DDL 压力和课程概览。
2. 上传 `数据库系统_实验三_报告模板.docx`，展示文件名识别和本地保存。
3. 上传一个 `.txt` 复习资料，正文包含「事务隔离」等关键词。
4. 粘贴通知：`数据库系统实验三报告本周五22:00前提交到学习通`。
5. 在确认页修改并归档。
6. 回首页搜索「实验三」或「事务隔离」，展示资料、通知、DDL 和正文摘要。
7. 进入课程详情页，查看完整归档，并预览或下载资料。

## 项目结构

```txt
app/          Next.js 页面路由
components/   UI 和业务组件
hooks/        数据 hook
lib/          类型、存储、识别、搜索、日期工具
scripts/      本地验证脚本
```

## 后续方向

- 支持 PDF / docx / pptx 正文解析
- 支持一个通知拆分多个待办
- 增加资料与通知、待办之间的关联推荐
- 接入云存储和账号体系
- 接入 OCR、向量搜索和学习平台导入
