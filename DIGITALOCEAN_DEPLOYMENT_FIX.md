name: sabq-ai-cms
region: nyc
services:
- build_command: npm run build:server
  environment_slug: node-js
  github:
    branch: main
    deploy_on_push: true
    repo: sabq4org/sabq-ai-cms
  http_port: 3000
  instance_count: 1
  instance_size_slug: professional-xs
  name: web
  run_command: npm start
  source_dir: / 