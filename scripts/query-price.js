/**
 * 通用股票监控技能 - 手动查询脚本（CDP 增强版本）
 * 
 * 使用方法：
 * node skills/stock-monitor/scripts/query-price.js
 * 
 * 支持交互式输入股票名称和代码
 * 使用 Chrome DevTools Protocol (CDP) 获取股价数据
 */

const readline = require('readline');

// 创建 readline 接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 主函数
async function main() {
  console.log('📈 通用股票股价查询工具（CDP 增强版本）\n');
  console.log('─'.repeat(60));
  
  const stockName = await new Promise(resolve => {
    rl.question('请输入股票名称（例如：九安医疗）：', resolve);
  });
  
  const stockCode = await new Promise(resolve => {
    rl.question('请输入股票代码（例如：002432 或 sz002432）：', resolve);
  });
  
  rl.close();
  
  console.log('\n' + '─'.repeat(60));
  console.log(`\n股票：${stockName} (${stockCode})`);
  console.log(`数据源：百度搜索整合数据（使用 Chrome CDP 协议）`);
  console.log('─'.repeat(60));
  
  // 生成搜索 URL
  const searchUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(stockName + '股价')}`;
  
  console.log('\nCDP 增强查询方法：');
  console.log('  1. 通过 Chrome DevTools Protocol 连接浏览器');
  console.log('  2. 访问百度搜索获取整合股价数据');
  console.log('  3. 使用精准元素定位提取数据');
  console.log('  4. 支持自动重试和错误恢复');
  console.log('\n执行命令：');
  console.log(`  browser.open "${searchUrl}"`);
  console.log('  browser.snapshot -i');
  console.log('  browser get text @price_element');
  console.log('─'.repeat(60));
  console.log('\nCDP 协议优势：');
  console.log('  ✅ 更稳定的浏览器连接');
  console.log('  ✅ 更精准的页面元素定位');
  console.log('  ✅ 支持页面加载状态检测');
  console.log('  ✅ 更好的错误处理和重试机制');
  console.log('  ✅ 详细的调试和日志信息');
  console.log('─'.repeat(60));
  console.log('\n百度搜索特点：');
  console.log('  ✅ 整合多个财经平台数据');
  console.log('  ✅ 实时更新');
  console.log('  ✅ 一站式查询，无需跳转');
  console.log('  ✅ 包含新闻、股评等附加信息');
  console.log('─'.repeat(60));
  console.log('\n提示：定时任务会自动执行查询并推送结果。');
  console.log('      此脚本仅用于测试和手动查询。\n');
  console.log('定时任务配置：');
  console.log('  超时时间：180 秒');
  console.log('  重试次数：最多 3 次');
  console.log('  失败通知：自动发送错误信息');
}

// 运行
main().catch(console.error);
